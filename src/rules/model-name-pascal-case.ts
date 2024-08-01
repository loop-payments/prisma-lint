import { z } from 'zod';

import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'model-name-pascal-case';

const Config = z
  .object({
    allowList: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
    trimPrefix: z
      .union([
        z.string(),
        z.instanceof(RegExp),
        z.array(z.union([z.string(), z.instanceof(RegExp)])),
      ])
      .optional(),
  })
  .strict();

/**
 * Checks that model names are in PascalCase.
 *
 * @example
 *   // good
 *   model DbUser {
 *     id String @id
 *   }
 *
 *   // bad
 *   model dbUser {
 *     id String @id
 *   }
 *
 *   // bad
 *   model db_user {
 *    id String @id
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { allowList, trimPrefix } = config;
    return {
      Model: (model) => {
        if (
          allowList?.some((pattern) =>
            pattern instanceof RegExp
              ? model.name.match(pattern)
              : model.name === pattern,
          )
        ) {
          return;
        }
        let nameWithoutPrefix = model.name;
        for (const prefix of Array.isArray(trimPrefix)
          ? trimPrefix
          : [trimPrefix]) {
          if (prefix === undefined) {
            continue;
          }
          if (prefix instanceof RegExp) {
            if (model.name.match(prefix)) {
              nameWithoutPrefix = model.name.replace(prefix, '');
              break;
            }
            continue;
          }
          if (model.name.startsWith(prefix)) {
            nameWithoutPrefix = model.name.slice(prefix.length);
            break;
          }
        }
        if (!nameWithoutPrefix.match(/^[A-Z][a-zA-Z0-9]*$/)) {
          const message = 'Model name should be in PascalCase.';
          context.report({ model, message });
        }
      },
    };
  },
} satisfies ModelRuleDefinition<z.infer<typeof Config>>;
