import type { Field, Model } from '@mrleebo/prisma-ast';

import pluralize from 'pluralize';
import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'list-field-name-grammatical-number';

const Config = z
  .object({
    style: z.enum(['singular', 'plural']),
    allowlist: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  })
  .strict();

/**
 * Checks that each list field name matches the plural or singular enforced style.
 * Only applies to fields that are arrays (list types).
 *
 * @example { style: "singular" }
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
 * @example { style: "plural" }
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
 * @example { style: "singular", allowlist: ["data"] }
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
    const { style } = config;
    const allowlist = config.allowlist ?? [];
    return {
      Field: (model: Model, field: Field) => {
        if (!field.array) {
          return;
        }

        const fieldName = field.name;
        if (allowlist.includes(fieldName)) {
          return;
        }

        const isPlural = pluralize.isPlural(fieldName);
        if (isPlural && style === 'singular') {
          context.report({
            model,
            field,
            message: 'Expected singular name for list field.',
          });
        }
        if (!isPlural && style === 'plural') {
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
