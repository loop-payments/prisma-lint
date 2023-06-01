import pluralize from 'pluralize';
import { z } from 'zod';

import { getRuleIgnoreParams } from '#src/common/ignore.js';
import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'forbid-field';

const Config = z
  .object({
    forbid: z.array(z.union([z.string(), z.instanceof(RegExp)])),
  })
  .strict();

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
  configSchema: Config,
  create: (config, context) => {
    const forbidWithRegExp = config.forbid.map((name) => ({
      name,
      nameRegExp: toRegExp(name),
    }));
    return {
      Field: (model, field) => {
        const ruleIgnoreParams = getRuleIgnoreParams(model, RULE_NAME);
        const ignoreNameSet = new Set(ruleIgnoreParams);

        const matches = forbidWithRegExp
          .filter((r) => r.nameRegExp.test(field.name))
          .filter((r) => !ignoreNameSet.has(r.name));
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
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
