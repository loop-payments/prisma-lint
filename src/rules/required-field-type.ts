import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'required-field-type';

/**
 * Requires certain fields to have a specific type.
 *
 *   {
 *     requirements: [
 *       { ifName: "id", type: "String" },
 *       { ifName: "/At$/", type: "DateTime" },
 *     ]
 *   }
 *
 * @example { requirements: [{ ifName: "id", type: "String" }] }
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
 * @example { requirements: [{ ifName: "/At$/", type: "DateTime" }] }
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
    const { required } = config;
    if (required == null) {
      throw new Error('Missing "required" key in configuration');
    }
    if (!Array.isArray(required)) {
      throw new Error('Config "required" value must be an array');
    }
    const rulesWithRegExp = required.map((r) => ({
      ...r,
      ifNameRegex: toRegExp(r.ifName),
    })) as { ifName: string; type: string; ifNameRegex: RegExp }[];
    return {
      Field: (model, field) => {
        const matches = rulesWithRegExp.filter((r) =>
          r.ifNameRegex.test(field.name),
        );
        if (matches.length === 0) {
          return;
        }
        const areMatchesConflicting =
          new Set(matches.map((m) => m.type)).size > 1;
        if (areMatchesConflicting) {
          const message = `Field has conflicting type requirements: ${JSON.stringify(
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
