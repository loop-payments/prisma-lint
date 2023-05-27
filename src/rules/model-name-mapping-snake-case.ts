import type { Model } from "@mrleebo/prisma-ast";
import type { RuleConfig } from "#src/common/config.js";
import type { Context, RuleDefinition } from "#src/common/rule.js";
import {
  findMapAttribute,
  findNameAttributeArg,
  listAttributes,
} from "#src/common/prisma.js";
import { getExpectedSnakeCase } from "#src/common/snake-case.js";

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
  meta: {
    defaultMessage: undefined,
  },
  create: (config: RuleConfig, context: Context) => {
    const { compoundWords: compoundWordsRaw, trimPrefix: trimPrefixRaw } =
      config;
    if (compoundWordsRaw && !Array.isArray(compoundWordsRaw)) {
      throw new Error(
        `Expected "compoundWords" to be an array, but got ${compoundWordsRaw}.`
      );
    }
    const compoundWords = (compoundWordsRaw as string[]) || undefined;
    if (trimPrefixRaw && typeof trimPrefixRaw !== "string") {
      throw new Error(
        `Expected "trimPrefix" to be a string, but got ${trimPrefixRaw}.`
      );
    }
    const trimPrefix = (trimPrefixRaw as string) || undefined;
    return {
      Model: (node: Model) => {
        const attributes = listAttributes(node);
        const mapAttribute = findMapAttribute(attributes);
        if (!mapAttribute) {
          context.report({
            node,
            message: "Model name must be mapped.",
          });
          return;
        }
        const nameAttribute = findNameAttributeArg(mapAttribute.args);
        if (!nameAttribute) {
          context.report({
            node,
            message: "Model name must be mapped.",
          });
          return;
        }
        const nodeName = node.name;
        const mappedName = nameAttribute.value.value;
        const expectedSnakeCase = getExpectedSnakeCase(nodeName, {
          compoundWords,
          trimPrefix,
        });
        if (mappedName !== expectedSnakeCase) {
          context.report({
            node,
            message:
              `Expected mapped model name to be snake case consistent ` +
              `with the model name "${expectedSnakeCase}".`,
          });
        }
      },
    };
  },
} satisfies RuleDefinition;
