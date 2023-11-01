import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'forbid-required-ignored-field';

const Config = z
  .object({
    allowIgnoreWithDefault: z.boolean(),
  })
  .strict();

/**
 * Forbids required ignored fields.
 *
 * <https://github.com/prisma/prisma/issues/13467>
 *
 * @example
 *   // good
 *   type Product {
 *     uuid String
 *     toBeRemoved String? @ignore
 *   }
 *
 *   // bad
 *   type Product {
 *     uuid String
 *     toBeRemoved String @ignore
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    return {
      Field: (model, field) => {
        const isIgnored = field?.attributes?.some(
          (attr) => attr.name === 'ignore',
        );
        const hasDefault = field?.attributes?.some(
          (attr) => attr.name === 'default',
        );

        if (!isIgnored) return;

        if (hasDefault && config.allowIgnoreWithDefault) return;

        const isRequired = !field.optional;
        if (!isRequired) return;

        const message = config.allowIgnoredWithDefault
          ? "Required field without defaults can't be ignored."
          : "Required field can't be ignored.";

        context.report({ model, field, message });
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
