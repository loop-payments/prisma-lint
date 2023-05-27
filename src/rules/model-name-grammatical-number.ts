import pluralize from 'pluralize';

import { z } from 'zod';

import { RULE_CONFIG_PARSE_PARAMS } from '#src/common/config.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-grammatical-number';

const Config = z.object({
  enforcedStyle: z.enum(['singular', 'plural']),
});

/**
 * Requires model name to match plural or singlar enforced style.
 *
 * https://en.wikipedia.org/wiki/Grammatical_number
 *
 * @example enforcedStyle: "singular"
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
 * @example enforcedStyle: "plural"
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
    const parsedConfig = Config.parse(config, RULE_CONFIG_PARSE_PARAMS);
    const { enforcedStyle } = parsedConfig;
    return {
      Model: (model) => {
        const isPlural = pluralize.isPlural(model.name);
        if (isPlural && enforcedStyle === 'singular') {
          context.report({ model, message: 'Expected singular model name.' });
        }
        if (!isPlural && enforcedStyle === 'plural') {
          context.report({ model, message: 'Expected plural model name.' });
        }
      },
    };
  },
} satisfies ModelRuleDefinition;
