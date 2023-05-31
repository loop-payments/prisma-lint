import { z } from 'zod';

import { listFields } from '#src/common/prisma.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'field-order';

const Config = z
  .object({
    order: z.array(z.string()),
  })
  .strict();

/**
 * Checks that fields within a model are in the correct order.
 *
 * Fields in the `order` list that are not present in the model are ignored.
 * (To require fields, use the `require-field` rule.)
 *
 * The first field in the `order` is interpreted to be required as
 * the first field in the model. The last field in the `order` is
 * interpreted to be required as the last field in the model.
 *
 * The special field name `...` can be used to indicate that any
 * number of fields can appear in the model at that point. This can
 * be used at the end of the `order` list to indicate that remaining
 * fields can appear in any order at the end of the model.
 *
 * @example { order: ['tenantId', 'id', createdAt', 'updatedAt', '...'] }
 *   // good
 *   model User {
 *     tenantId String
 *     id String @id
 *     email String
 *   }
 *
 *   model User {
 *     tenantId String
 *     id String @id
 *     createdAt DateTime
 *     email String
 *   }
 *
 *   // bad
 *   model User {
 *     id String @id
 *     email String
 *     tenantId String
 *   }
 *
 * @example { order: ['tenantId', 'id', '...', 'createdAt', 'updatedAt'] }
 *   // good
 *   model User {
 *     tenantId String
 *     id String
 *     email String
 *     createdAt DateTime
 *     updatedAt DateTime
 *   }
 *
 *   model User {
 *     tenantId String
 *     id String
 *     email String
 *     createdAt DateTime
 *   }
 *
 *   // bad
 *   model User {
 *     id String @id
 *     createdAt DateTime
 *     email String
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (config, context) => {
    const { order } = config;
    return {
      Model: (model) => {
        const fields = listFields(model);
        const fieldNameSet = new Set(fields.map((field) => field.name));
        const actualNames = fields.map((field) => field.name);
        const expectedNames = order.filter(
          (name) => fieldNameSet.has(name) || name === '...',
        );
        let e = 0;
        let a = 0;
        const outOfOrderFieldNames = [];
        while (e < expectedNames.length && a < actualNames.length) {
          const expectedName = expectedNames[e];
          const nextExpectedName = expectedNames[e + 1];
          const actualName = actualNames[a];
          if (actualName === expectedName) {
            e += 1;
            a += 1;
            continue;
          }
          if (expectedName === '...') {
            if (actualName == nextExpectedName) {
              e += 1;
              continue;
            } else {
              a += 1;
              continue;
            }
          }
          outOfOrderFieldNames.push(actualName);
          a += 1;
        }
        if (a < actualNames.length) {
          outOfOrderFieldNames.push(...actualNames.slice(a));
        }
        if (outOfOrderFieldNames.length === 0) {
          return;
        }
        const message = `Fields are not in the expected order: ${expectedNames
          .map((f) => `"${f}"`)
          .join(', ')}.`;
        context.report({ model, message });
      },
    };
  },
} satisfies ModelRuleDefinition<z.infer<typeof Config>>;
