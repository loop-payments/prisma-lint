import pluralize from 'pluralize';

import type { ModelRuleDefinition } from '#src/common/rule.js';

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
  create: (config, context) => {
    const { enforcedStyle } = config;
    if (
      typeof enforcedStyle !== 'string' ||
      ['singular', 'plural'].includes(enforcedStyle) === false
    ) {
      throw new Error(
        'Expected enforcedStyle to be one of ' +
          `"singular" or "plural", got ${enforcedStyle}`,
      );
    }
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
