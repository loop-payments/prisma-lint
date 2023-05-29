import pluralize from 'pluralize';
import { z } from 'zod';

import { RULE_CONFIG_PARSE_PARAMS } from '#src/common/config.js';
import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'forbid-field';

const Config = z.object({
  forbid: z.array(z.union([z.string(), z.instanceof(RegExp)])),
});

/**
 * Forbids fields with certain names.
 *
 * @example { forbid: ["id"] }
 *   // good
 *   type Product {
 *     uuid String
 *   }
 *
 *   // bad
 *   type Product {
 *     id String
 *   }
 *
 *
 * @example { forbid: ["/^(?!.*[aA]mountD6$).*D6$/"] }
 *   // good
 *   type Product {
 *     id String
 *     priceAmountD6 Int
 *   }
 *
 *   // bad
 *   type Product {
 *     id Int
 *     priceD6 Int
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  create: (config, context) => {
    const parsedConfig = Config.parse(config, RULE_CONFIG_PARSE_PARAMS);
    const forbidWithRegExp = parsedConfig.forbid.map((name) => ({
      name,
      nameRegExp: toRegExp(name),
    })) as { name: string; nameRegExp: RegExp }[];
    return {
      Field: (model, field) => {
        const matches = forbidWithRegExp.filter((r) =>
          r.nameRegExp.test(field.name),
        );
        if (matches.length === 0) {
          return;
        }
        const message = `Field "${field.name}" is forbid by ${pluralize(
          'rule',
          matches.length,
        )}: ${matches.map((m) => `"${m.name}"`).join(', ')}.`;
        context.report({ model, field, message });
      },
    };
  },
} satisfies FieldRuleDefinition;
