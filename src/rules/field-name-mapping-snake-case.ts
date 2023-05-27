import type { Attribute, Field, Model } from '@mrleebo/prisma-ast';

import {
  PRISMA_SCALAR_TYPES,
  findNameAttributeArg,
} from '#src/common/prisma.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';
import { getExpectedSnakeCase } from '#src/common/snake-case.js';

/**
 * Requires that the mapped name of a field is the expected snake case.
 *
 * @example
 *   // good
 *   model UserRole {
 *     userId String @map(name: "user_id")
 *   }
 *
 *   // good
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
 *   // bad
 *   model UserRole {
 *     userId String @map(name: "user_i_d")
 *   }
 *
 *
 * @example compoundWords: ["GraphQL"]
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
 */
export default {
  create: (config, context) => {
    const { compoundWords: compoundWordsRaw } = config;
    if (compoundWordsRaw && !Array.isArray(compoundWordsRaw)) {
      throw new Error(
        `Expected "compoundWords" to be an array, but got ${compoundWordsRaw}.`,
      );
    }
    const compoundWords = (compoundWordsRaw as string[]) || undefined;
    return {
      Field: (model: Model, field: Field) => {
        if (allowedToHaveNoMapping(field)) {
          return;
        }
        const report = (message: string) =>
          context.report({ model, field, message });
        const { attributes } = field;
        if (!attributes) {
          report('Expected');
          return;
        }
        const mapAttribute = findMapAttribute(attributes);
        if (!mapAttribute || !mapAttribute.args) {
          report('Field name must be mapped to snake case.');
          return;
        }
        const nameAttribute = findNameAttributeArg(mapAttribute.args);
        if (!nameAttribute) {
          report('Model name must be mapped to snake case.');
          return;
        }
        const fieldName = field.name;
        const mappedName = nameAttribute.value.value.replaceAll('"', '');
        const expectedSnakeCase = getExpectedSnakeCase(fieldName, {
          compoundWords,
        });
        if (mappedName !== expectedSnakeCase) {
          report(
            'Expected mapped name to be snake case consistent ' +
              `with the field name "${expectedSnakeCase}".`,
          );
        }
      },
    };
  },
} satisfies FieldRuleDefinition;

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

export function allowedToHaveNoMapping(field: Field) {
  return isAllLowerCase(field.name) || isAssociation(field.fieldType);
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
