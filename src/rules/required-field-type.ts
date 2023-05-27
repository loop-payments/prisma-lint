import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'required-field-type';

/**
 * Requires certain fields to have a specific type.
 *
 *   {
 *     fields: [
 *       { name: "id", type: "String" },
 *       { name: "/At$/", type: "DateTime" },
 *     ]
 *   }
 *
 * @example { fields: [{ name: "id", type: "String" }] }
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
 * @example { fields: [{ name: "/At$/", type: "DateTime" }] }
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
    const { fields: fieldRules } = config;
    if (fieldRules == null) {
      throw new Error('Missing required config "fields"');
    }
    if (!Array.isArray(fieldRules)) {
      throw new Error('Config "fields" must be an array');
    }
    const rulesWithRegExp = fieldRules.map((r) => ({
      ...r,
      regex: toRegExp(r.name),
    }));
    return {
      Field: (model, field) => {
        const matches = rulesWithRegExp.filter((r) => r.regex.test(field.name));
        if (matches.length === 0) {
          return;
        }
        const areMatchesConflicting =
          new Set(matches.map((m) => m.type)).size > 1;
        if (areMatchesConflicting) {
          const message = `Field has conflicting type requirements: ${JSON.stringify(
            matches.map(({ name, type }) => ({ name, type })),
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
