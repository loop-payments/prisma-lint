import type { Model } from '@mrleebo/prisma-ast';

import {
  findMapAttribute,
  findNameAttributeArg,
  listAttributes,
} from '#src/common/prisma.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';
import { getExpectedSnakeCase } from '#src/common/snake-case.js';

/**
 * Requires that the mapped name of a model is the expected snake case.
 *
 * @example
 *   // good
 *   model UserRole {
 *     id String @id
 *     @map(name: "user_role")
 *   }
 *
 *   // bad
 *   model UserRole {
 *     id String @id
 *   }
 *
 *   // bad
 *   model UserRole {
 *     id String @id
 *     @map(name: "user_roles")
 *   }
 *
 *
 * @example trimPrefix: "Db"
 *   // good
 *   model DbUserRole {
 *    id String @id
 *    @map(name: "user_role")
 *   }
 *
 *   // bad
 *   model DbUserRole {
 *     id String @id
 *     @map(name: "db_user_role")
 *   }
 *
 *
 * @example compoundWords: ["GraphQL"]
 *   // good
 *   model GraphQLPersistedQuery {
 *     id String @id
 *     @map(name: "graphql_persisted_query")
 *   }
 *
 *   // bad
 *   model GraphQLPersistedQuery {
 *     id String @id
 *     @map(name: "graph_q_l_persisted_query")
 *   }
 *
 */
export default {
  create: (config, context) => {
    const { compoundWords: compoundWordsRaw, trimPrefix: trimPrefixRaw } =
      config;
    if (compoundWordsRaw && !Array.isArray(compoundWordsRaw)) {
      throw new Error(
        `Expected "compoundWords" to be an array, but got ${compoundWordsRaw}.`,
      );
    }
    const compoundWords = (compoundWordsRaw as string[]) || undefined;
    if (trimPrefixRaw && typeof trimPrefixRaw !== 'string') {
      throw new Error(
        `Expected "trimPrefix" to be a string, but got ${trimPrefixRaw}.`,
      );
    }
    const trimPrefix = (trimPrefixRaw as string) || undefined;
    return {
      Model: (model: Model) => {
        const attributes = listAttributes(model);
        const mapAttribute = findMapAttribute(attributes);
        if (!mapAttribute) {
          context.report({
            model,
            message: 'Model name must be mapped to snake case.',
          });
          return;
        }
        const nameAttribute = findNameAttributeArg(mapAttribute.args);
        if (!nameAttribute) {
          context.report({
            model,
            message: 'Model name must be mapped to snake case.',
          });
          return;
        }
        const nodeName = model.name;
        const mappedName = nameAttribute.value.value.replaceAll('"', '');
        const expectedSnakeCase = getExpectedSnakeCase(nodeName, {
          compoundWords,
          trimPrefix,
        });
        if (mappedName !== expectedSnakeCase) {
          context.report({
            model,
            message:
              'Expected mapped model name to be snake case consistent ' +
              `with the model name "${expectedSnakeCase}".`,
          });
        }
      },
    };
  },
} satisfies ModelRuleDefinition;
