import { z } from 'zod';

import { RULE_CONFIG_PARSE_PARAMS } from '#src/common/config.js';
import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'required-field-type';

const Config = z.object({
  required: z.array(
    z.object({
      ifName: z.union([z.string(), z.instanceof(RegExp)]),
      type: z.string(),
    }),
  ),
});

/**
 * Requires certain fields to have a specific type.
 *
 *   {
 *     required: [
 *       { ifName: "id", type: "String" },
 *       { ifName: "/At$/", type: "DateTime" },
 *     ]
 *   }
 *
 * @example { required: [{ ifName: "id", type: "String" }] }
 *   // good
 *   type User {
 *     id String
 *   }
 *
 *   // bad
 *   type User {
 *     id Int
 *   }
 *
 * @example { required: [{ ifName: "/At$/", type: "DateTime" }] }
 *   // good
 *   type User {
 *     createdAt DateTime
 *     updatedAt DateTime
 *   }
 *
 *   // bad
 *   type User {
 *     createdAt string
 *     updatedAt string
 *   }
 */
export default {
  ruleName: RULE_NAME,
  create: (config, context) => {
    const parsedConfig = Config.parse(config, RULE_CONFIG_PARSE_PARAMS);
    const requiredWithRegExp = parsedConfig.required.map((r) => ({
      ...r,
      ifNameRegExp: toRegExp(r.ifName),
    })) as { ifName: string; type: string; ifNameRegExp: RegExp }[];
    return {
      Field: (model, field) => {
        const matches = requiredWithRegExp.filter((r) =>
          r.ifNameRegExp.test(field.name),
        );
        if (matches.length === 0) {
          return;
        }
        const areMatchesConflicting =
          new Set(matches.map((m) => m.type)).size > 1;
        if (areMatchesConflicting) {
          const message = `Field has conflicting type required: ${JSON.stringify(
            matches.map(({ ifName, type }) => ({
              ifName,
              type,
            })),
          )}`;

          context.report({ model, field, message });
        }
        const actualType = field.fieldType;
        const expectedType = matches[0].type;
        if (actualType !== expectedType) {
          const message = `Field type "${actualType}" does not match expected type "${expectedType}"`;
          context.report({ model, field, message });
        }
      },
    };
  },
} satisfies FieldRuleDefinition;
