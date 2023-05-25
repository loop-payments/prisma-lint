import {
  type Context,
  PrismaPropertyType,
  type RuleConfigValue,
  type RuleDefinition,
} from "#src/util.js";
import type { Model } from "@mrleebo/prisma-ast";
import pluralize from "pluralize";

/**
 * Warns if model name does not match plural or singlar convention.
 *
 * @example grammaticalNumber: "singular"
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
 * @example grammaticalNumber: "plural"
 *   // bad
 *   model User {
 *     id String @id
 *   }
 *
 *   // good
 *   model Users {
 *     id String @id
 *   }
 *
 */
export default {
  meta: {
    defaultMessage: undefined,
  },
  create: (config: RuleConfigValue, context: Context) => {
    const { grammaticalNumber } = config;
    if (
      typeof grammaticalNumber !== "string" ||
      ["singular", "plural"].includes(grammaticalNumber) === false
    ) {
      throw new Error(
        `Expected grammaticalNumber to be one of ` +
          `"singular" or "plural", got ${grammaticalNumber}`
      );
    }
    return {
      Model: (node: Model) => {
        const isPlural = pluralize.isPlural(node.name);
        if (isPlural && grammaticalNumber === "singular") {
          context.report({ node, message: "Expected singular model name." });
        }
        if (!isPlural && grammaticalNumber === "plural") {
          context.report({ node, message: "Expected plural model name." });
        }
      },
    };
  },
} satisfies RuleDefinition;
