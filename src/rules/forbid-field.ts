import pluralize from 'pluralize';
import { z } from 'zod';

import { getRuleIgnoreParams } from '#src/common/ignore.js';
import { toRegExp } from '#src/common/regex.js';
import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'forbid-field';

const Config = z
  .object({
    forbid: z.array(z.union([z.string(), z.instanceof(RegExp)])),
  })
  .strict();

/**
 * Forbids fields with certain names.
 *
 * @example { forbid: ["id"] }
 *   // good
 *   type Product {
 *     uuid String
 *   }
 *
 *   // bad
 *   type Product {
 *     id String
 *   }
 *
 *
 * @example { forbid: ["/^(?!.*[aA]mountD6$).*D6$/"] }
 *   // good
 *   type Product {
 *     id String
 *     priceAmountD6 Int
 *   }
 *
 *   // bad
 *   type Product {
 *     id Int
 *     priceD6 Int
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const forbidWithRegExp = config.forbid.map((name) => ({
      name,
      nameRegExp: toRegExp(name),
    }));
    return {
      Field: (model, field) => {
        const ruleIgnoreParams = getRuleIgnoreParams(model, RULE_NAME);
        const ignoreNameSet = new Set(ruleIgnoreParams);
        if (ignoreNameSet.has(field.name)) {
          return;
        }

        const matches = forbidWithRegExp.filter((r) =>
          r.nameRegExp.test(field.name),
        );
        if (matches.length === 0) {
          return;
        }
        const message = `Field "${field.name}" is forbid by ${pluralize(
          'rule',
          matches.length,
        )}: ${matches.map((m) => `"${m.name}"`).join(', ')}.`;

        // Testing out location.
        const { location: modelLocation } = model;
        const { location: fieldLocation } = field;
        if (!modelLocation) {
          throw new Error('Expected model to have location');
        }
        if (!fieldLocation) {
          throw new Error('Expected field to have location');
        }
        console.log(modelLocation);
        console.log(fieldLocation);
        const lines = context.sourceCode.split('\n');
        const { startLine, startColumn, endLine, endColumn } = modelLocation;
        if (
          startLine == null ||
          startColumn == null ||
          endLine == null ||
          endColumn == null
        ) {
          throw new Error(
            'Expected location to have startLine, startColumn, endLine, endColumn',
          );
        }
        const line = lines[startLine - 1];
        const underline =
          ' '.repeat(startColumn - 1) + '^'.repeat(endColumn - startColumn + 1);
        console.log(line);
        console.log(underline);

        context.report({ model, field, message });
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;
