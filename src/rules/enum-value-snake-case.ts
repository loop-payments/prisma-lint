import { z } from 'zod';

import { getRuleIgnoreParams } from '#src/common/ignore.js';
import {
  matchesAllowList,
  trimPrefix,
} from '#src/common/rule-config-helpers.js';
import type { EnumRuleDefinition } from '#src/common/rule.js';
import { toSnakeCase } from '#src/common/snake-case.js';

const RULE_NAME = 'enum-value-snake-case';

const Config = z
  .object({
    case: z.enum(['lower', 'upper']).default('lower'),
    allowList: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
    trimPrefix: z
      .union([
        z.string(),
        z.instanceof(RegExp),
        z.array(z.union([z.string(), z.instanceof(RegExp)])),
      ])
      .optional(),
  })
  .strict();

/**
 * Checks that enum values are in the usual snake_case
 * (optionally `SCREAMING_SNAKE_CASE` via configuration case: 'upper').
 *
 * This rule supports selectively ignoring enum values via the
 * `prisma-lint-ignore-enum` comment, like so:
 *
 *     /// prisma-lint-ignore-enum enum-value-snake-case NotIn_Snake_Case
 *
 * That will permit an enum value of `Not_In_Snake_Case`. Other
 * values for the enum must still be in snake_case. A comma-separated list of values
 * can be provided to ignore multiple enum values.
 *
 * @example
 *   // good
 *   enum Example {
 *     value
 *   }
 *
 *   // good
 *   enum Example {
 *     value_1
 *   }
 *
 *   // good
 *   enum Example {
 *     /// prisma-lint-ignore-enum enum-value-snake-case NotIn_Snake_Case
 *     NotIn_Snake_Case
 *   }
 *
 *   // bad
 *   enum Example {
 *     Value
 *   }
 *
 *   // bad
 *   enum Example {
 *     VALUE
 *   }
 *
 *   // bad
 *   enum Example {
 *     camelCase
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { allowList, trimPrefix: trimPrefixConfig } = config;
    return {
      Enum: (enumObj) => {
        enumObj.enumerators
          .filter((enumerator) => enumerator.type === 'enumerator')
          .forEach((enumValue) => {
            if (
              getRuleIgnoreParams(enumObj, RULE_NAME).includes(enumValue.name)
            ) {
              return;
            }
            if (matchesAllowList(enumValue.name, allowList)) {
              return;
            }
            const valueWithoutPrefix = trimPrefix(
              enumValue.name,
              trimPrefixConfig,
            );
            const screaming = config.case === 'upper';
            const snakeCasedValue = toSnakeCase(valueWithoutPrefix, { screaming });
            if (valueWithoutPrefix !== snakeCasedValue) {
              const message = `Enum value should be in ${screaming ? 'SCREAMING_SNAKE_CASE' : 'snake_case'}: '${valueWithoutPrefix}' (expected '${snakeCasedValue}').`;
              context.report({ enum: enumObj, message });
            }
          });
      },
    };
  },
} satisfies EnumRuleDefinition<z.infer<typeof Config>>;
