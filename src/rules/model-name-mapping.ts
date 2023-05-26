import type { Model } from "@mrleebo/prisma-ast";
import type { RuleConfig } from "#src/common/config.js";
import type { Context, RuleDefinition } from "#src/common/rule.js";

/**
 * Requires model names to map to a value that match expectations.
 *
 * Expectations can be defined as a regex or a list of regexes with
 * the "regex" option. Another option is "enforceConsistentSnakeCase",
 * which will enforce that all model names are snake case and that
 * they are consistent with the actual model name.
 *
 * @example enforceConsistentSnakeCase: true
 *   // good
 *   model UserRole {
 *     id String @id
 *     @map(name: "user_role")
 *   }
 *
 *   // bad
 *   model UserRole {
 *     id String @id
 *   }
 *
 *   // bad
 *   model UserRole {
 *     id String @id
 *     @map(name: "user_roles")
 *   }
 *
 *
 * @example regex: "/^(?!db_).*$"
 *   // good
 *   model DbUserRole {
 *    id String @id
 *    @map(name: "user_role")
 *  }
 *
 *  // bad
 *  model DbUserRole {
 *    id String @id
 *    @map(name: "db_user_role")
 *  }
 *
 */
export default {
  meta: {
    defaultMessage: undefined,
  },
  create: (config: RuleConfig, context: Context) => {
    const { regex, enforceConsistentSnakeCase } = config;
    const regexList = Array.isArray(regex) ? regex : [];
    if (typeof regex === "string") {
      regexList.push(regex);
    }
    if (
      typeof enforceConsistentSnakeCase === "boolean" &&
      enforceConsistentSnakeCase
    ) {
      regexList.push("^[a-z][a-z0-9_]*$");
    }
    return {
      Model: (node: Model) => {
        const message = `Expected mapping for model to match`;
        context.report({ node, message });
      },
    };
  },
} satisfies RuleDefinition;
