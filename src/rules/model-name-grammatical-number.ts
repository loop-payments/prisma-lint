import {
  type Context,
  PrismaPropertyType,
  type RuleConfigValue,
  type RuleDefinition,
} from "#src/util.js";
import type { Model } from "@mrleebo/prisma-ast";
import pluralize from "pluralize";

/**
 * Warns if model name is plural rather than singular.
 *
 * @example
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
        const commentFields = node.properties.filter(
          (p: any) => p.type === PrismaPropertyType.COMMENT
        ) as any[];
        const hasOmitComment =
          commentFields.length > 0 && commentFields[0].text === "///not-plural";
        if (hasOmitComment) {
          return;
        }
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
