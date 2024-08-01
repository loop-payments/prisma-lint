import { z } from 'zod';

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
            if (matchesAllowList(enumValue.name, allowList)) {
              return;
            }
            const nameWithoutPrefix = trimPrefix(
              enumValue.name,
              trimPrefixConfig,
            );
            if (nameWithoutPrefix !== toSnakeCase(nameWithoutPrefix)) {
              const message = 'Enum value should be in snake_case.';
              context.report({ enum: enumObj, message });
            }
          });
      },
    };
  },
} satisfies EnumRuleDefinition<z.infer<typeof Config>>;
