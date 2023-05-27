import { listFields } from '#src/common/prisma.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

/**
 * Requires that a model has certain fields.
 *
 * The `requiredFields` config option is an array of strings or objects.
 * Each string is the name of a field that must be present. Each object
 * defines a field that must be present if another field is present.
 *
 *   requiredFields: (
 *     string |
 *     { name: string; ifField: string; }
 *   )[];
 *
 * The `ifField` property of an object can be a string or a regular expression.
 * For example, to require a model to have a field named "currencyCode"
 * if it has a field ending in "amountD6":
 *
 *   {
 *     name: "currencyCode";
 *     ifField: "/[a|A]mountD6$/";
 *   }
 *
 *
 * @example requiredFields: ["id"]
 *   // good
 *   model User {
 *     id Int @id
 *   }
 *
 *   // bad
 *   model User {
 *     name string
 *   }
 *
 *
 * @example requiredFields: [{ name: "currencyCode", ifField: "/mountD6$/" }]
 *   // good
 *   model Product {
 *     currencyCode string
 *     priceAmountD6 Int
 *   }
 *
 *  // bad
 *  model Product {
 *    priceAmountD6 Int
 *  }
 *
 *
 */
export default {
  create: (config, context) => {
    const { requiredFields } = config;
    if (requiredFields == null) {
      throw new Error('Missing requiredFields');
    }
    if (!Array.isArray(requiredFields)) {
      throw new Error('requiredFields must be an array');
    }
    const requiredNames = requiredFields.filter((f) => typeof f === 'string');
    const conditionalRequiredFields = requiredFields.filter(
      (f) => typeof f === 'object',
    );
    conditionalRequiredFields.forEach((f) => {
      if (f.name == null) {
        throw new Error('Missing name in requiredFields object');
      }
      if (typeof f.name !== 'string') {
        throw new Error('requiredFields object name must be a string');
      }
      if (f.ifField == null) {
        throw new Error('Missing ifField in requiredFields object');
      }
      if (typeof f.ifField !== 'string' && !(f.ifField instanceof RegExp)) {
        throw new Error('requiredFields object ifField must be a string');
      }
    });
    const simpleIfFieldConditions = conditionalRequiredFields.filter(
      (f) => !isRegexOrRegexStr(f.ifField),
    );
    const regexIfFieldConditions = conditionalRequiredFields
      .filter((f) => isRegexOrRegexStr(f.ifField))
      .map((f) => {
        const { ifField } = f;
        const ifFieldRegex =
          typeof f === 'string' ? new RegExp(ifField.slice(1, -1)) : ifField;
        return { ...f, ifFieldRegex };
      });
    return {
      Model: (model) => {
        const fields = listFields(model);
        const fieldNameSet = new Set(fields.map((f) => f.name));
        const missingFields = [];
        for (const requiredName of requiredNames) {
          if (!fieldNameSet.has(requiredName)) {
            missingFields.push(requiredName);
          }
        }
        for (const condition of simpleIfFieldConditions) {
          if (
            fieldNameSet.has(condition.ifField) &&
            !fieldNameSet.has(condition.name)
          ) {
            missingFields.push(condition.name);
          }
        }
        for (const condition of regexIfFieldConditions) {
          if (
            fields.some((f) => condition.ifFieldRegex.test(f.name)) &&
            !fieldNameSet.has(condition.name)
          ) {
            missingFields.push(condition.name);
          }
        }
        if (missingFields.length > 0) {
          context.report({
            message: `Model "${
              model.name
            }" is missing required fields: ${missingFields.join(', ')}`,
            model,
          });
        }
      },
    };
  },
} satisfies ModelRuleDefinition;

const isRegexOrRegexStr = (value: any) => {
  return (
    value instanceof RegExp || (value.startsWith('/') && value.endsWith('/'))
  );
};
