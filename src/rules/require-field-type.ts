import { z } from 'zod';

import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'require-field-type';

const Config = z
  .object({
    require: z.array(
      z.object({
        ifName: z.union([z.string(), z.instanceof(RegExp)]),
        type: z.string(),
        nativeType: z.string().optional(),
      }),
    ),
  })
  .strict();

/**
 * Checks that certain fields have a specific type.
 *
 * @example { require: [{ ifName: "id", type: "String" }] }
 *   // good
 *   model User {
 *     id String
 *   }
 *
 *   // bad
 *   model User {
 *     id Int
 *   }
 *
 * @example { require: [{ ifName: "/At$/", type: "DateTime" }] }
 *   // good
 *   model User {
 *     createdAt DateTime
 *     updatedAt DateTime
 *   }
 *
 *   // bad
 *   model User {
 *     createdAt String
 *     updatedAt String
 *   }
 *
 * @example { require: [{ ifName: "id", type: "String", nativeType: "Uuid" }] }
 *   // good
 *   model User {
 *     id String @db.Uuid
 *   }
 *
 *   // bad
 *   model User {
 *     id Int
 *   }
 *
 *   // bad
 *   model User {
 *     id String
 *   }
 *
 *   // bad
 *   model User {
 *     id String @db.Oid
 *   }
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const requireWithRegExp = config.require.map((r) => ({
      ...r,
      ifNameRegExp: toRegExp(r.ifName),
    }));
    return {
      Field: (model, field) => {
        const matches = requireWithRegExp.filter((r) =>
          r.ifNameRegExp.test(field.name),
        );
        if (matches.length === 0) {
          return;
        }
        const areMatchesConflicting =
          new Set(matches.map(({ type }) => type)).size > 1 ||
          new Set(matches.map(({ nativeType }) => nativeType).filter(Boolean))
            .size > 1;
        if (areMatchesConflicting) {
          const message = `Field has conflicting type require: ${JSON.stringify(
            matches.map(({ ifName, type, nativeType }) => ({
              ifName,
              type,
              nativeType,
            })),
          )}.`;

          context.report({ model, field, message });
        }

        const messages = [];

        const actualType = field.fieldType;
        const expectedType = matches[0].type;
        if (actualType !== expectedType) {
          messages.push(
            `Field type "${actualType}" does not match expected type "${expectedType}".`,
          );
        }

        const expectedNativeType = matches[0].nativeType;
        const actualNativeType = field.attributes?.find(
          (attr) => attr.group === 'db',
        )?.name;
        if (expectedNativeType && !actualNativeType) {
          messages.push(
            `Field native type is not specified, but expected native type "${expectedNativeType}".`,
          );
        } else if (
          expectedNativeType &&
          actualNativeType !== expectedNativeType
        ) {
          messages.push(
            `Field native type "${actualNativeType}" does not match expected native type "${expectedNativeType}".`,
          );
        }

        if (messages.length > 0) {
          const message = messages.join('\n');
          context.report({ model, field, message });
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
