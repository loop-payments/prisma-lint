import { z } from 'zod';

import { RULE_CONFIG_PARSE_PARAMS } from '#src/common/config.js';
import { getRuleIgnoreParams } from '#src/common/ignore.js';
import { listFields } from '#src/common/prisma.js';
import { isRegexOrRegexStr } from '#src/common/regex.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'require-field';

const Config = z.object({
  require: z.array(
    z.union([
      z.string(),
      z.object({
        name: z.string(),
        ifSibling: z.union([z.string(), z.instanceof(RegExp)]),
      }),
    ]),
  ),
});

/**
 * Checks that a model has certain fields.
 *
 * This rules supports selective ignoring via the `prisma-lint-ignore-model`
 * comment, like so:
 *
 *     /// prisma-lint-ignore-model require-field tenantId
 *
 * That will ignore only `tenantId` field violations for the model. Other
 * require fields will still be enforced. A comma-separated list of fields
 * can be provided to ignore multiple require fields.
 *
 * @example { require: ["id"] }
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
 * @example { require: [{ name: "currencyCode", ifSibling: "/mountD6$/" }] }
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
  ruleName: RULE_NAME,
  create: (config, context) => {
    const parsedConfig = Config.parse(config, RULE_CONFIG_PARSE_PARAMS);
    const { require } = parsedConfig;
    const requireNames = require.filter(
      (f) => typeof f === 'string',
    ) as string[];
    const conditions = require.filter((f) => typeof f === 'object') as {
      name: string;
      ifSibling: string | RegExp;
    }[];
    const simpleIfSiblingConditions = conditions.filter(
      (f) => !isRegexOrRegexStr(f.ifSibling),
    ) as { name: string; ifSibling: string }[];
    const regexIfSiblingConditions = conditions
      .filter((f) => isRegexOrRegexStr(f.ifSibling))
      .map((f) => {
        const { ifSibling } = f;
        const ifSiblingRegExp =
          typeof ifSibling === 'string'
            ? new RegExp(ifSibling.slice(1, -1))
            : ifSibling;
        return { ...f, ifSiblingRegExp };
      }) as { name: string; ifSiblingRegExp: RegExp }[];
    return {
      Model: (model) => {
        const ruleIgnoreParams = getRuleIgnoreParams(model, RULE_NAME);
        const ignoreNameSet = new Set(ruleIgnoreParams);

        const fields = listFields(model);
        const fieldNameSet = new Set(fields.map((f) => f.name));

        const missingFields = [];

        for (const requireName of requireNames) {
          if (ignoreNameSet.has(requireName)) {
            continue;
          }
          if (!fieldNameSet.has(requireName)) {
            missingFields.push(requireName);
          }
        }

        for (const condition of simpleIfSiblingConditions) {
          if (ignoreNameSet.has(condition.name)) {
            continue;
          }
          if (
            fieldNameSet.has(condition.ifSibling) &&
            !fieldNameSet.has(condition.name)
          ) {
            missingFields.push(condition.name);
          }
        }

        for (const condition of regexIfSiblingConditions) {
          if (ignoreNameSet.has(condition.name)) {
            continue;
          }
          if (
            fields.some((f) => condition.ifSiblingRegExp.test(f.name)) &&
            !fieldNameSet.has(condition.name)
          ) {
            missingFields.push(condition.name);
          }
        }

        if (missingFields.length > 0) {
          context.report({
            message: `Missing require fields: ${missingFields
              .map((f) => `"${f}"`)
              .join(', ')}.`,
            model,
          });
        }
      },
    };
  },
} satisfies ModelRuleDefinition;
