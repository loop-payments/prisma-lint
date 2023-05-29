import pluralize from 'pluralize';

import { z } from 'zod';

import { parseRuleConfig } from '#src/common/config.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-grammatical-number';

const Config = z
  .object({
    style: z.enum(['singular', 'plural']),
  })
  .strict();

/**
 * Checks that each model name matches the plural or singlar enforced style.
 *
 * <https://en.wikipedia.org/wiki/Grammatical_number>
 *
 * @example { style: "singular" }
 *   // good
 *   model User {
 *     id String @id
 *   }
 *
 *   // bad
 *   model Users {
 *     id String @id
 *   }
 *
 * @example { style: "plural" }
 *   // good
 *   model Users {
 *     id String @id
 *   }
 *
 *   // bad
 *   model User {
 *     id String @id
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  create: (config, context) => {
    const parsedConfig = parseRuleConfig(RULE_NAME, Config, config);
    const { style } = parsedConfig;
    return {
      Model: (model) => {
        const isPlural = pluralize.isPlural(model.name);
        if (isPlural && style === 'singular') {
          context.report({ model, message: 'Expected singular model name.' });
        }
        if (!isPlural && style === 'plural') {
          context.report({ model, message: 'Expected plural model name.' });
        }
      },
    };
  },
} satisfies ModelRuleDefinition;
