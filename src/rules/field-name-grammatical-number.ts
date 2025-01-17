import type { Field, Model } from '@mrleebo/prisma-ast';

import pluralize from 'pluralize';
import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'field-name-grammatical-number';

const Config = z
  .object({
    ifList: z.enum(['singular', 'plural']),
    ifListAllow: z
      .array(z.union([z.string(), z.instanceof(RegExp)]))
      .optional(),
  })
  .strict();

/**
 * Checks that each list field name matches the plural or singular enforced style.
 * Only applies to fields that are arrays (list types).
 *
 * @example { ifList: "singular" }
 *   // good
 *   model User {
 *     email String[]
 *   }
 *
 *   // bad
 *   model User {
 *     emails String[]
 *   }
 *
 * @example { ifList: "plural" }
 *   // good
 *   model User {
 *     emails String[]
 *   }
 *
 *   // bad
 *   model User {
 *     email String[]
 *   }
 *
 * @example { ifList: "singular", ifListAllow: ["data"] }
 *   // good
 *   model User {
 *     data String[]
 *     email String[]
 *   }
 *
 *   // bad
 *   model User {
 *     emails String[]
 *   }
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { ifListAllow, ifList } = config;
    const allowlist = ifListAllow ?? [];
    return {
      Field: (model: Model, field: Field) => {
        if (!field.array) {
          return;
        }

        const fieldName = field.name;
        if (
          allowlist.includes(fieldName) ||
          allowlist.some(
            (item) => item instanceof RegExp && item.test(fieldName),
          )
        ) {
          return;
        }

        const isPlural = pluralize.isPlural(fieldName);
        if (isPlural && ifList === 'singular') {
          context.report({
            model,
            field,
            message: 'Expected singular name for list field.',
          });
        }
        if (!isPlural && ifList === 'plural') {
          context.report({
            model,
            field,
            message: 'Expected plural name for list field.',
          });
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
