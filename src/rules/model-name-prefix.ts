import { z } from 'zod';

import { RULE_CONFIG_PARSE_PARAMS } from '#src/common/config.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-prefix';

const Config = z.object({
  prefix: z.string(),
});

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
    const parsedConfig = Config.parse(config, RULE_CONFIG_PARSE_PARAMS);
    const { prefix } = parsedConfig;
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
