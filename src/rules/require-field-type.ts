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
          new Set(matches.map((m) => m.type)).size > 1;
        if (areMatchesConflicting) {
          const message = `Field has conflicting type require: ${JSON.stringify(
            matches.map(({ ifName, type }) => ({
              ifName,
              type,
            })),
          )}.`;

          context.report({ model, field, message });
        }
        const actualType = field.fieldType;
        const expectedType = matches[0].type;
        if (actualType !== expectedType) {
          const message = `Field type "${actualType}" does not match expected type "${expectedType}".`;
          context.report({ model, field, message });
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
