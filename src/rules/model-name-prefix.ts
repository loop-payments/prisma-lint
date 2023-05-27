import type { Model } from "@mrleebo/prisma-ast";
import pluralize from "pluralize";
import type { RuleConfig } from "#src/common/config.js";
import type { Context, RuleDefinition } from "#src/common/rule.js";

/**
 * Requires model names to include a prefix.
 *
 * This is useful for avoiding name collisions with
 * application-level types in cases where a single
 * domain object is persisted in multiple tables,
 * and the application type differs from the table
 * structure.
 *
 * @example prefix: "Db"
 *   // good
 *   model DbUser {
 *     id String @id
 *   }
 *
 *   // bad
 *   model Users {
 *     id String @id
 *   }
 *
 */
export default {
  create: (config: RuleConfig, context: Context) => {
    const { prefix } = config;
    if (typeof prefix !== "string") {
      throw new Error(`Expected string prefix, got ${JSON.stringify(prefix)}`);
    }
    return {
      Model: (node: Model) => {
        if (node.name.startsWith(prefix)) {
          return;
        }
        const message = `Model name "${node.name}" should start with "${prefix}"`;
        context.report({ node, message });
      },
    };
  },
} satisfies RuleDefinition;
