import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'forbid-required-ignored-field';

const Config = z.object({}).strict().optional();

/**
 * Forbids required ignored fields without default values.
 *
 * This prevents a client from being generated without a field while
 * the database still expects the corresponding column to be non-nullable.
 *
 * For more protection against breaking changes, consider using:
 *
 * <https://github.com/loop-payments/prisma-safety>
 *
 * @example
 *   // good
 *   type Product {
 *     uuid String
 *     toBeRemoved String? @ignore
 *   }
 *
 *   // good
 *   type Product {
 *     uuid String
 *     toBeRemoved Boolean @default(false) @ignore
 *   }
 *
 *   // bad
 *   type Product {
 *     uuid String
 *     toBeRemoved String @ignore
 *   }
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
        const isRelation = field?.attributes?.some(
          (attr) => attr.name === 'relation',
        );
        if (!isIgnored || hasDefault || isRelation) return;
        const isRequired = !field.optional;
        if (!isRequired) return;
        const message =
          'Do not ignore a required field without a default value.';
        context.report({ model, field, message });
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
