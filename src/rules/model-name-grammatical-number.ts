import pluralize from 'pluralize';

import { z } from 'zod';

import { isRegexOrRegexStr, toRegExp } from '#src/common/regex.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-grammatical-number';

const Config = z
  .object({
    style: z.enum(['singular', 'plural']),
    allowlist: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  })
  .strict();

/**
 * Checks that each model name matches the plural or singlar enforced style.
 *
 * <https://en.wikipedia.org/wiki/Grammatical_number>
 *
 * @example { style: "singular" }
 *   // good
 *   model User {
 *     id String @id
 *   }
 *
 *   // bad
 *   model Users {
 *     id String @id
 *   }
 *
 * @example { style: "plural" }
 *   // good
 *   model Users {
 *     id String @id
 *   }
 *
 *   // bad
 *   model User {
 *     id String @id
 *   }
 *
 * @example { style: "singular", allowlist: ["UserData"] }
 *   // good
 *   model UserData {
 *     id String @id
 *   }
 *
 *   model User {
 *     id String @id
 *   }
 *
 *   model Tenant {
 *     id String @id
 *   }
 *
 *   // bad ("data" is considered plural by default)
 *   model TenantData {
 *     id String @id
 *   }
 *
 *   model Users {
 *     id String @id
 *   }
 *
 * @example { style: "singular", allowlist: ["/Data$/"] }
 *   // good
 *   model UserData {
 *     id String @id
 *   }
 *
 *   model TenantData {
 *     id String @id
 *   }
 *
 *   // bad
 *   model DataRecords {
 *     id String @id
 *   }
 *
 *   model Users {
 *     id String @id
 *   }
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { style } = config;
    const allowlist = config.allowlist ?? [];
    const simpleAllowlist = allowlist.filter((s) => !isRegexOrRegexStr(s));
    const regexAllowlist = allowlist
      .filter((s) => isRegexOrRegexStr(s))
      .map(toRegExp);
    return {
      Model: (model) => {
        const modelName = model.name;
        if (simpleAllowlist.includes(modelName)) {
          return;
        }
        if (regexAllowlist.some((r) => r.test(modelName))) {
          return;
        }
        const isPlural = pluralize.isPlural(modelName);
        if (isPlural && style === 'singular') {
          context.report({ model, message: 'Expected singular model name.' });
        }
        if (!isPlural && style === 'plural') {
          context.report({ model, message: 'Expected plural model name.' });
        }
      },
    };
  },
} satisfies ModelRuleDefinition<z.infer<typeof Config>>;
