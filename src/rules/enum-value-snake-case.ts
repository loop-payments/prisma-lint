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
 * Checks that enum values are in snake_case.
 *
 * This rule supports selectively ignoring enum values via the
 * `prisma-lint-ignore-enum` comment, like so:
 *
 *     /// prisma-lint-ignore-enum enum-value-snake-case SCREAMING_SNAKE
 *
 * That will permit an enum value of `SCREAMING_SNAKE`. Other
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
              ),
              snakeCasedValue = toSnakeCase(valueWithoutPrefix);
            if (valueWithoutPrefix !== snakeCasedValue) {
              const message = `Enum value should be in snake_case: '${valueWithoutPrefix}' (expected '${snakeCasedValue}').`;
              context.report({ enum: enumObj, message });
            }
          });
      },
    };
  },
} satisfies EnumRuleDefinition<z.infer<typeof Config>>;
