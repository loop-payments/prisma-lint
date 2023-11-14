import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'forbid-required-ignored-field';

const Config = z.object({}).strict();

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
  create: (_, context) => {
    return {
      Field: (model, field) => {
        const isIgnored = field?.attributes?.some(
          (attr) => attr.name === 'ignore',
        );
        const hasDefault = field?.attributes?.some(
          (attr) => attr.name === 'default',
        );
        if (!isIgnored || hasDefault) return;
        const isRequired = !field.optional;
        if (!isRequired) return;
        const message = "Cannot ignore a required field without a default value.";
        context.report({ model, field, message });
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
