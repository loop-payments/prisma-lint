import { z } from 'zod';

import { toCamelCase } from '#src/common/camel-case.js';
import { getRuleIgnoreParams } from '#src/common/ignore.js';
import { toPascalCase } from '#src/common/pascal-case.js';
import {
  matchesAllowList,
  trimPrefix,
} from '#src/common/rule-config-helpers.js';
import type { EnumRuleDefinition } from '#src/common/rule.js';
import { toSnakeCase } from '#src/common/snake-case.js';

const RULE_NAME = 'enum-value-case';

const Config = z
  .object({
    style: z.enum(['snake', 'camel', 'pascal']),
    case: z.enum(['lower', 'upper']).optional(),
    compoundWords: z.array(z.string()).optional(),
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
 * Checks that enum values are in the specified case style: snake_case, camelCase, or PascalCase.
 *
 * Defaults to lower snake_case.
 *
 * Use the `style` option to specify the case style, and the optional `case` option to enforce
 * upper or lower case for snake_case style.
 *
 * This rule supports selectively ignoring enum values via the
 * `prisma-lint-ignore-enum` comment, like so:
 *
 *     /// prisma-lint-ignore-enum enum-value-case NotValidCase
 *
 * That will permit an enum value of `NotValidCase`. Other
 * values for the enum must still be in the specified case style. A comma-separated list of values
 * can be provided to ignore multiple enum values.
 *
 * @example { style: "snake" }
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
 * @example { style: "snake", case: "upper" }
 *   // good
 *   enum Example {
 *     VALUE
 *   }
 *
 *   // good
 *   enum Example {
 *     VALUE_1
 *   }
 *
 *   // bad
 *   enum Example {
 *     Value
 *   }
 *
 *   // bad
 *   enum Example {
 *     value
 *   }
 *
 *   // bad
 *   enum Example {
 *     camelCase
 *   }
 *
 * @example { style: "camel" }
 *   // good
 *   enum Example {
 *     exampleValue
 *   }
 *
 *   // good
 *   enum Example {
 *     exampleValue1
 *   }
 *
 *   // bad
 *   enum Example {
 *     example_value
 *   }
 *
 *   // bad
 *   enum Example {
 *     EXAMPLE_VALUE
 *   }
 *
 *   // bad
 *   enum Example {
 *     ExampleValue
 *   }
 *
 * @example { style: "pascal" }
 *   // good
 *   enum Example {
 *     ExampleValue
 *   }
 *
 *   // good
 *   enum Example {
 *     ExampleValue1
 *   }

 *   // bad
 *   enum Example {
 *     example_value
 *   }
 *
 *   // bad
 *   enum Example {
 *     EXAMPLE_VALUE
 *   }
 *
 *   // bad
 *   enum Example {
 *     exampleValue
 *   }
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const {
      allowList,
      trimPrefix: trimPrefixConfig,
      compoundWords,
      case: caseConfig,
      style,
    } = config;
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

            if (style === 'pascal') {
              const expectedValue = toPascalCase(valueWithoutPrefix, {
                compoundWords,
              });
              if (valueWithoutPrefix !== expectedValue) {
                const message = `Enum value should be in PascalCase: '${valueWithoutPrefix}' (expected '${expectedValue}').`;
                context.report({ enum: enumObj, message });
              }
            } else if (style === 'camel') {
              const expectedValue = toCamelCase(valueWithoutPrefix, {
                compoundWords,
              });
              if (valueWithoutPrefix !== expectedValue) {
                const message = `Enum value should be in camelCase: '${valueWithoutPrefix}' (expected '${expectedValue}').`;
                context.report({ enum: enumObj, message });
              }
            } else {
              const expectedValue = toSnakeCase(valueWithoutPrefix, {
                compoundWords,
                case: caseConfig,
              });
              if (valueWithoutPrefix !== expectedValue) {
                const message = `Enum value should be in snake_case: '${valueWithoutPrefix}' (expected '${expectedValue}').`;
                context.report({ enum: enumObj, message });
              }
            }
          });
      },
    };
  },
} satisfies EnumRuleDefinition<z.infer<typeof Config>>;
