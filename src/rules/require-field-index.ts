import type {
  Field,
  KeyValue,
  Model,
  BlockAttribute,
  Value,
} from '@mrleebo/prisma-ast';
import { z } from 'zod';

import { getRuleIgnoreParams as listRuleIgnoreParams } from '#src/common/ignore.js';
import {
  assertValueIsStringArray,
  isKeyValue,
  isValue,
  listAttributes,
  listFields,
} from '#src/common/prisma.js';
import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'require-field-index';

const Config = z
  .object({
    forAllRelations: z.boolean().optional(),
    forNames: z
      .union([z.string(), z.array(z.union([z.string(), z.instanceof(RegExp)]))])
      .optional(),
  })
  .strict();

/**
 * Checks that certain fields have indices.
 *
 * This rule supports selectively ignoring fields via the
 * `prisma-lint-ignore-model` comment, like so:
 *
 *     /// prisma-lint-ignore-model require-field-index tenantId
 *
 * That will ignore only `tenantId` violations for the model. Other
 * required indices will still be enforced. A comma-separated list of fields
 * can be provided to ignore multiple fields.
 *
 * @example { forNames: ["createdAt"] }
 *   // good
 *   model User {
 *     createdAt DateTime @unique
 *   }
 *
 *   model User {
 *     createdAt DateTime
 *     @@index([createdAt])
 *   }
 *
 *   model User {
 *     createdAt DateTime
 *     id String
 *     @@index([createdAt, id])
 *   }
 *
 *   // bad
 *   model User {
 *     createdAt string
 *   }
 *
 *   model User {
 *     createdAt DateTime
 *     id String
 *     @@index([id, createdAt])
 *   }
 *
 * @example { forNames: "/Id$/" ] }
 *   // good
 *   model User {
 *     tenantId String
 *     @@index([tenantId])
 *   }
 *
 *   // bad
 *   model User {
 *     tenantId String
 *   }
 *
 * @example { forAllRelations: true }
 *   // good
 *   type Bar {
 *     fooId String
 *     foo Foo @relation(fields: [fooId], references: [id])
 *     @@index([fooId])
 *   }
 *
 *   // bad
 *   type Bar {
 *     fooId String
 *     foo Foo @relation(fields: [fooId], references: [id])
 *   }
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const forAllRelations = config.forAllRelations ?? false;
    const forNames = config.forNames ?? [];
    const forNamesList = Array.isArray(forNames) ? forNames : [forNames];
    const forNamesRexExpList = forNamesList.map((r) => toRegExp(r));
    // Each file gets its own instance of the rule, so we don't need
    // to worry about model name collisions across files.
    const indexSetByModelName = new Map<string, IndexSet>();
    const relationSetByModelName = new Map<string, RelationSet>();
    return {
      Field: (model, field) => {
        const fieldName = field.name;
        const modelName = model.name;

        const ruleIgnoreParams = listRuleIgnoreParams(model, RULE_NAME);
        const ignoreNameSet = new Set(ruleIgnoreParams);
        if (ignoreNameSet.has(fieldName)) {
          return;
        }

        if (isIdField(field) || isUniqueField(field)) {
          return;
        }

        const report = () => {
          const message = `Field "${fieldName}" must have an index.`;
          context.report({ model, field, message });
        };

        const getIndexSet = () => {
          if (!indexSetByModelName.has(modelName)) {
            indexSetByModelName.set(modelName, extractIndexSet(model));
          }
          const indexSet = indexSetByModelName.get(modelName);
          if (!indexSet) {
            throw new Error(`Expected index set for ${modelName}.`);
          }
          return indexSet;
        };

        const matches = forNamesRexExpList.filter((r) => r.test(fieldName));
        if (matches.length > 0) {
          const indexSet = getIndexSet();
          if (!indexSet.has(fieldName)) {
            report();
            return;
          }
        }

        if (forAllRelations) {
          const indexSet = getIndexSet();
          if (!relationSetByModelName.has(modelName)) {
            relationSetByModelName.set(modelName, extractRelationSet(model));
          }
          const relationSet = relationSetByModelName.get(modelName);
          if (!relationSet) {
            throw new Error(`Expected relation set for ${modelName}.`);
          }
          if (relationSet.has(fieldName) && !indexSet.has(fieldName)) {
            report();
          }
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;

type IndexSet = Set<string>;
type RelationSet = Set<string>;

function extractRelationSet(model: Model): RelationSet {
  const fields = listFields(model);
  const set = new Set<string>();
  fields.forEach((field) => {
    const relations = extractRelationFieldNames(field);
    relations.forEach((relation) => {
      set.add(relation);
    });
  });
  return set;
}

function extractIndexSet(model: Model): IndexSet {
  const modelAttributes = listAttributes(model);
  const set = new Set<string>();
  modelAttributes.forEach((value) => {
    if (value.name === 'index') {
      set.add(extractPrimaryFieldNameFromRelationListAttribute(value));
    } else if (value.name === 'unique') {
      set.add(extractPrimaryFieldNameFromRelationListAttribute(value));
    }
  });
  return set;
}

function isIdField(field: Field): boolean {
  return Boolean(
    field.attributes?.find((attribute) => attribute.name === 'id'),
  );
}

function isUniqueField(field: Field): boolean {
  return Boolean(
    field.attributes?.find((attribute) => attribute.name === 'unique'),
  );
}

function extractPrimaryFieldNameFromRelationListAttribute(
  attribute: BlockAttribute,
): string {
  const [arg] = attribute.args;
  let value: Value;
  if (!isValue(arg.value)) {
    // these arguments are describing a complex relation
    const fieldsValue: Value | undefined = (
      attribute.args.find(({ value }) => {
        if (isKeyValue(value)) {
          return value.key === 'fields';
        }

        return false;
      })?.value as KeyValue
    ).value;

    if (fieldsValue == null) {
      throw new Error(
        `Failed to parse attribute, could not find fields argument ${JSON.stringify(
          attribute,
        )}`,
      );
    }

    value = fieldsValue;
  } else {
    value = arg.value;
  }

  // @@index(value) or @@unique(value)
  if (typeof value === 'string') {
    return value;
  }

  // @@index([value]) or @@unique([value])
  const [firstFieldValue] = assertValueIsStringArray(value);
  if (typeof firstFieldValue === 'string') {
    // it should always be a string
    return firstFieldValue;
  }

  throw new Error('Failed to parse attribute, first value is not a string');
}

function extractRelationFieldNames(field: Field): Array<string> {
  const relationAttribute = field.attributes?.find(
    (attribute) => attribute.name === 'relation',
  );
  const fieldsArg = relationAttribute?.args?.find((arg) => {
    if (isKeyValue(arg.value)) {
      return arg.value.key === 'fields';
    }

    return false;
  });

  if (fieldsArg == null) {
    return [];
  }

  const fieldsArgValue = (fieldsArg.value as KeyValue).value;
  return assertValueIsStringArray(fieldsArgValue);
}
