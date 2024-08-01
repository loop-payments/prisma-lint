import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'ban-unbounded-string-type';

const Config = z
  .object({
    allowNativeTextType: z.boolean().optional(),
  })
  .strict();

/**
 * Checks that String fields are defined with a database native type to
 * limit the length, e.g. `@db.VarChar(x)`.
 * Motivation inspired by https://brandur.org/text - to avoid unintentionally
 * building public APIs that support unlimited-length strings.
 *
 * @example
 *   // good
 *   model User {
 *     id String @db.VarChar(36)
 *   }
 *
 *   // bad
 *   model User {
 *     id String
 *   }
 *
 *   // bad
 *   model User {
 *    id String @db.Text
 *   }
 *
 * @example { allowNativeTextType: true }
 *   // good
 *   model User {
 *     id String @db.Text
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { allowNativeTextType } = config;
    return {
      Field: (model, field) => {
        if (field.fieldType !== 'String') {
          return;
        }

        const nativeTypeAttribute = field.attributes?.find(
          (attr) => attr.group === 'db',
        );

        if (
          !nativeTypeAttribute ||
          (nativeTypeAttribute.name === 'Text' && !allowNativeTextType)
        ) {
          const message =
            'String fields must have a native type attribute to ensure maximum length, e.g. `@db.VarChar(x)`.';
          context.report({ model, field, message });
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
