import type { Attribute } from '@mrleebo/prisma-ast';

import { z } from 'zod';

import { PRISMA_SCALAR_TYPES, getMappedName } from '#src/common/prisma.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';
import { toSnakeCase } from '#src/common/snake-case.js';

const RULE_NAME = 'field-name-mapping-snake-case';

const Config = z
  .object({
    compoundWords: z.array(z.string()).optional(),
    requireUnderscorePrefixForIds: z.boolean().optional(),
  })
  .strict()
  .optional();

/**
 * Checks that the mapped name of a field is the expected snake case.
 *
 * @example
 *   // good
 *   model UserRole {
 *     userId String @map(name: "user_id")
 *   }
 *
 *   model UserRole {
 *     // No mapping needed.
 *     id String
 *   }
 *
 *   // bad
 *   model UserRole {
 *     userId String
 *   }
 *
 *   model UserRole {
 *     userId String @map(name: "user_i_d")
 *   }
 *
 *
 * @example { compoundWords: ["GraphQL"] }
 *   // good
 *   model PersistedQuery {
 *     graphQLId String @map(name: "graphql_id")
 *   }
 *
 *   // bad
 *   model PersistedQuery {
 *     graphQLId String @map(name: "graph_q_l_id")
 *   }
 *
 * @example { requireUnderscorePrefixForIds: true }
 *   // good
 *   model PersistedQuery {
 *     id String @id @map(name: "_id")
 *     otherField String @map(name: "other_field")
 *   }
 *
 *   // bad
 *   model PersistedQuery {
 *     id String @id @map(name: "id")
 *     otherField String @map(name: "other_field")
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { compoundWords, requireUnderscorePrefixForIds } = config ?? {};
    return {
      Field: (model, field) => {
        if (isAssociation(field.fieldType)) {
          return;
        }

        // A helper function to report a problem with the field.
        const report = (message: string) =>
          context.report({ model, field, message });

        const { attributes, name: fieldName } = field;
        const isIdWithRequiredPrefix =
          requireUnderscorePrefixForIds &&
          attributes?.find((a) => a.name === 'id');
        const isMappingRequired =
          !isAllLowerCase(fieldName) || isIdWithRequiredPrefix;

        if (!attributes) {
          if (isMappingRequired) {
            report('Field name must be mapped to snake case.');
          }
          return;
        }
        const mapAttribute = findMapAttribute(attributes);
        if (!mapAttribute || !mapAttribute.args) {
          if (isMappingRequired) {
            report('Field name must be mapped to snake case.');
          }
          return;
        }
        const mappedName = getMappedName(mapAttribute.args);
        if (!mappedName) {
          if (isMappingRequired) {
            report('Field name must be mapped to snake case.');
          }
          return;
        }
        let expectedSnakeCase = toSnakeCase(fieldName, { compoundWords });
        if (isIdWithRequiredPrefix) {
          expectedSnakeCase = `_${expectedSnakeCase}`;
        }
        if (mappedName !== expectedSnakeCase) {
          report(`Field name must be mapped to "${expectedSnakeCase}".`);
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;

function findMapAttribute(attributes: Attribute[]): Attribute | undefined {
  const filtered = attributes.filter((a) => a.name === 'map');
  if (filtered.length === 0) {
    return;
  }
  if (filtered.length > 1) {
    throw Error(
      `Unexpected multiple map attributes! ${JSON.stringify(filtered)}`,
    );
  }
  return filtered[0];
}

function isAssociation(fieldType: any) {
  if (typeof fieldType != 'string') {
    return false;
  }
  if (PRISMA_SCALAR_TYPES.has(fieldType)) {
    return false;
  }
  return true;
}

function isAllLowerCase(s: string) {
  return s.toLowerCase() == s;
}
