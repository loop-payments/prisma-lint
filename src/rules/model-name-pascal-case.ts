import { z } from 'zod';

import {
  configAllowList,
  configTrimPrefix,
  matchesAllowList,
  trimPrefix,
} from '#src/common/rule-config-helpers.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-pascal-case';

const Config = z
  .object({
    allowList: configAllowList,
    trimPrefix: configTrimPrefix,
  })
  .strict();

/**
 * Checks that model names are in PascalCase.
 *
 * @example
 *   // good
 *   model DbUser {
 *     id String @id
 *   }
 *
 *   // bad
 *   model dbUser {
 *     id String @id
 *   }
 *
 *   // bad
 *   model db_user {
 *    id String @id
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { allowList, trimPrefix: trimPrefixConfig } = config;
    return {
      Model: (model) => {
        if (matchesAllowList(model.name, allowList)) {
          return;
        }
        const nameWithoutPrefix = trimPrefix(model.name, trimPrefixConfig);
        if (!nameWithoutPrefix.match(/^[A-Z][a-zA-Z0-9]*$/)) {
          const message = 'Model name should be in PascalCase.';
          context.report({ model, message });
        }
      },
    };
  },
} satisfies ModelRuleDefinition<z.infer<typeof Config>>;
