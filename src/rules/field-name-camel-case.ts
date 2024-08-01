import { z } from 'zod';

import {
  configAllowList,
  configTrimPrefix,
  matchesAllowList,
  trimPrefix,
} from '#src/common/rule-config-helpers.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'field-name-camel-case';

const Config = z
  .object({
    allowList: configAllowList,
    trimPrefix: configTrimPrefix,
  })
  .strict();

/**
 * Checks that field names are in camelCase.
 *
 * @example
 *   // good
 *   model User {
 *     rowId String @id
 *   }
 *
 *   // bad
 *   model User {
 *     RowId String @id
 *   }
 *
 *   // bad
 *   model User {
 *    row_id String @id
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { allowList, trimPrefix: trimPrefixConfig } = config;
    return {
      Field: (model, field) => {
        if (matchesAllowList(field.name, allowList)) {
          return;
        }
        const nameWithoutPrefix = trimPrefix(field.name, trimPrefixConfig);
        if (!nameWithoutPrefix.match(/^[a-z][a-zA-Z0-9]*$/)) {
          const message = 'Field name should be in camelCase.';
          context.report({ model, field, message });
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
