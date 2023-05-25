import {
  type Context,
  type RuleConfig,
  type RuleDefinition,
} from "#src/util.js";
import type { Model } from "@mrleebo/prisma-ast";
import pluralize from "pluralize";

/**
 * Errors if model name does not match plural or singlar enforced style.
 *
 * @example enforcedStyle: "singular"
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
 * @example enforcedStyle: "plural"
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
 */
export default {
  meta: {
    defaultMessage: undefined,
  },
  create: (config: RuleConfig, context: Context) => {
    const { enforcedStyle } = config;
    if (
      typeof enforcedStyle !== "string" ||
      ["singular", "plural"].includes(enforcedStyle) === false
    ) {
      throw new Error(
        `Expected enforcedStyle to be one of ` +
          `"singular" or "plural", got ${enforcedStyle}`
      );
    }
    return {
      Model: (node: Model) => {
        const isPlural = pluralize.isPlural(node.name);
        if (isPlural && enforcedStyle === "singular") {
          context.report({ node, message: "Expected singular model name." });
        }
        if (!isPlural && enforcedStyle === "plural") {
          context.report({ node, message: "Expected plural model name." });
        }
      },
    };
  },
} satisfies RuleDefinition;
