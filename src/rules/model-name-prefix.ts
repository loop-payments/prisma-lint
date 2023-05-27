import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-prefix';

/**
 * Requires model names to include a prefix.
 *
 * This is useful for avoiding name collisions with
 * application-level types in cases where a single
 * domain object is persisted in multiple tables,
 * and the application type differs from the table
 * structure.
 *
 * @example prefix: "Db"
 *   // good
 *   model DbUser {
 *     id String @id
 *   }
 *
 *   // bad
 *   model Users {
 *     id String @id
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  create: (config, context) => {
    const { prefix } = config;
    if (typeof prefix !== 'string') {
      throw new Error(`Expected string prefix, got ${JSON.stringify(prefix)}`);
    }
    return {
      Model: (model) => {
        if (model.name.startsWith(prefix)) {
          return;
        }
        const message = `Model name should start with "${prefix}"`;
        context.report({ model, message });
      },
    };
  },
} satisfies ModelRuleDefinition;
