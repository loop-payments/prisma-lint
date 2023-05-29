import { z } from 'zod';

import { parseRuleConfig } from '#src/common/config.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-prefix';

const Config = z
  .object({
    prefix: z.string(),
  })
  .strict();

/**
 * Checks that model names include a required prefix.
 *
 * This is useful for avoiding name collisions with
 * application-level types in cases where a single
 * domain object is persisted in multiple tables,
 * and the application type differs from the table
 * structure.
 *
 * @example { prefix: "Db" }
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
    const parsedConfig = parseRuleConfig(RULE_NAME, Config, config);
    const { prefix } = parsedConfig;
    return {
      Model: (model) => {
        if (model.name.startsWith(prefix)) {
          return;
        }
        const message = `Model name should start with "${prefix}".`;
        context.report({ model, message });
      },
    };
  },
} satisfies ModelRuleDefinition;
