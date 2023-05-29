import type {
  Field,
  KeyValue,
  Model,
  ModelAttribute,
  Value,
} from '@mrleebo/prisma-ast';
import { z } from 'zod';

import { RULE_CONFIG_PARSE_PARAMS } from '#src/common/config.js';
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

const RULE_NAME = 'required-field-index';

const Config = z.object({
  forAllRelations: z.boolean().optional(),
  forNames: z
    .union([z.string(), z.array(z.union([z.string(), z.instanceof(RegExp)]))])
    .optional(),
});

/**
 * Checks that certain fields have indices.
 *
 * This rules supports selective ignoring via the `prisma-lint-ignore-model`
 * comment, like so:
 *
 *     /// prisma-lint-ignore-model required-field-index tenantId
 *
 * That will ignore only `tenantId` violations for the model. Other
 * required indices will still be enforced. A comma-separated list of fields
 * can be provided to ignore multiple fields.
 *
 * @example { required: ["createdAt"] }
 *   // good
 *   type User {
 *     createdAt DateTime @unique
 *   }
 *
 *   type User {
 *     createdAt DateTime
 *     @@index([createdAt])
 *   }
 *
 *   type User {
 *     createdAt DateTime
 *     id String
 *     @@index([createdAt, id])
 *   }
 *
 *   // bad
 *   type User {
 *     createdAt string
 *   }
 *
 *   type User {
 *     createdAt DateTime
 *     id String
 *     @@index([id, createdAt])
 *   }
 *
 * @example { required: [{ ifName: "/Id$/" }] }
 *   // good
 *   type User {
 *     tenantId String
 *     @@index([tenantId])
 *   }
 *
 *   // bad
 *   type User {
 *     tenantId String
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  create: (config, context) => {
    const parsedConfig = Config.parse(config, RULE_CONFIG_PARSE_PARAMS);
    const forAllRelations = parsedConfig.forAllRelations ?? false;
    const ifFieldName = parsedConfig.forNames ?? [];
    const ifFieldNameList = Array.isArray(ifFieldName)
      ? ifFieldName
      : [ifFieldName];
    const ifFieldNameRexExpList = ifFieldNameList.map((r) => toRegExp(r));
    // Each file gets its own instance of the rule, so we don't need
    // to worry about model name collisions across files.
    const indexSetByModelName = new Map<string, IndexSet>();
    const relationSetByModelName = new Map<string, RelationSet>();
    return {
      Field: (model, field) => {
        const ruleIgnoreParams = listRuleIgnoreParams(model, RULE_NAME);
        const ignoreNameSet = new Set(ruleIgnoreParams);
        const fieldName = field.name;
        if (ignoreNameSet.has(fieldName)) {
          return;
        }
        const matches = ifFieldNameRexExpList.filter((r) => r.test(fieldName));
        if (matches.length === 0) {
          return;
        }
        if (isUniqueField(field)) {
          return;
        }
        const modelName = model.name;
        if (!indexSetByModelName.has(modelName)) {
          indexSetByModelName.set(modelName, getIndexSet(model));
        }
        const indexSet = indexSetByModelName.get(modelName);
        if (!indexSet) {
          throw new Error(`Expected index set for ${modelName}`);
        }
        if (indexSet.has(fieldName)) {
          return;
        }
        if (forAllRelations) {
          if (!relationSetByModelName.has(modelName)) {
            relationSetByModelName.set(modelName, getRelationSet(model));
          }
          const relationSet = relationSetByModelName.get(modelName);
          if (!relationSet) {
            throw new Error(`Expected relation set for ${modelName}`);
          }
          if (relationSet.has(fieldName)) {
            return;
          }
        }
        const message = `Field "${fieldName}" is must have an index.`;
        context.report({ model, field, message });
      },
    };
  },
} satisfies FieldRuleDefinition;

type IndexSet = Set<string>;
type RelationSet = Set<string>;

function getRelationSet(model: Model): RelationSet {
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

function getIndexSet(model: Model): IndexSet {
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
function isUniqueField(field: Field): boolean {
  return Boolean(
    field.attributes?.find((attribute) => attribute.name === 'unique'),
  );
}

function extractPrimaryFieldNameFromRelationListAttribute(
  attribute: ModelAttribute,
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
