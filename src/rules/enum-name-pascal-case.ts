import { z } from 'zod';

import {
  matchesAllowList,
  trimPrefix,
} from '#src/common/rule-config-helpers.js';
import type { EnumRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'enum-name-pascal-case';

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
 * Checks that enum names are in PascalCase.
 *
 * @example
 *   // good
 *   enum ExampleOptions {
 *     value1
 *   }
 *
 *   // bad
 *   enum exampleOptions {
 *     value1
 *   }
 *
 *   // bad
 *   enum example_options {
 *    value1
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
        if (matchesAllowList(enumObj.name, allowList)) {
          return;
        }
        const nameWithoutPrefix = trimPrefix(enumObj.name, trimPrefixConfig);
        if (!nameWithoutPrefix.match(/^[A-Z][a-zA-Z0-9]*$/)) {
          const message = 'Enum name should be in PascalCase.';
          context.report({ enum: enumObj, message });
        }
      },
    };
  },
} satisfies EnumRuleDefinition<z.infer<typeof Config>>;
