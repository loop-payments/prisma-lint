import type { ModelAttribute } from '@mrleebo/prisma-ast';

import { z } from 'zod';

import { findNameAttributeArg, listAttributes } from '#src/common/prisma.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';
import { toSnakeCase } from '#src/common/snake-case.js';

const RULE_NAME = 'model-name-mapping-snake-case';

const Config = z
  .object({
    compoundWords: z.array(z.string()).optional(),
    trimPrefix: z.string().optional(),
  })
  .strict()
  .optional();

/**
 * Checks that the mapped name of a model is the expected snake case.
 *
 * @example
 *   // good
 *   model UserRole {
 *     id String @id
 *     @@map(name: "user_role")
 *   }
 *
 *   // bad
 *   model UserRole {
 *     id String @id
 *   }
 *
 *   model UserRole {
 *     id String @id
 *     @@map(name: "user_roles")
 *   }
 *
 *
 * @example { trimPrefix: "Db" }
 *   // good
 *   model DbUserRole {
 *     id String @id
 *     @@map(name: "user_role")
 *   }
 *
 *   // bad
 *   model DbUserRole {
 *     id String @id
 *     @@map(name: "db_user_role")
 *   }
 *
 *
 * @example { compoundWords: ["GraphQL"] }
 *   // good
 *   model GraphQLPersistedQuery {
 *     id String @id
 *     @@map(name: "graphql_persisted_query")
 *   }
 *
 *   // bad
 *   model GraphQLPersistedQuery {
 *     id String @id
 *     @@map(name: "graph_q_l_persisted_query")
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const compoundWords = config?.compoundWords ?? [];
    const trimPrefix = config?.trimPrefix ?? '';
    return {
      Model: (model) => {
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
        const expectedSnakeCase = toSnakeCase(nodeName, {
          compoundWords,
          trimPrefix,
        });
        if (mappedName !== expectedSnakeCase) {
          context.report({
            model,
            message: `Model name must be mapped to "${expectedSnakeCase}".`,
          });
        }
      },
    };
  },
} satisfies ModelRuleDefinition<z.infer<typeof Config>>;

function findMapAttribute(
  attributes: ModelAttribute[],
): ModelAttribute | undefined {
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
