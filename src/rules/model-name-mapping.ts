import type { Model } from "@mrleebo/prisma-ast";
import type { RuleConfig } from "#src/common/config.js";
import type { Context, RuleDefinition } from "#src/common/rule.js";
import {
  findMapAttribute,
  findNameAttributeArg,
  listAttributes,
} from "../common/prisma.js";
import { getConsistentSnakeCase } from "../common/snake-case.js";

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
    const { regex, enforceConsistentSnakeCase: enforceConsistentSnakeCaseRaw } =
      config;
    const regexList = Array.isArray(regex) ? regex : [];
    if (typeof regex === "string") {
      regexList.push(regex);
    }
    const enforceConsistentSnakeCase =
      typeof enforceConsistentSnakeCaseRaw === "boolean" &&
      enforceConsistentSnakeCaseRaw;
    return {
      Model: (node: Model) => {
        const attributes = listAttributes(node);
        const mapAttribute = findMapAttribute(attributes);
        if (!mapAttribute) {
          context.report({
            node,
            message: "Model name must be mapped.",
          });
          return;
        }
        const nameAttribute = findNameAttributeArg(mapAttribute.args);
        if (!nameAttribute) {
          context.report({
            node,
            message: "Model name must be mapped.",
          });
          return;
        }

        const nodeName = node.name;
        const mappedName = nameAttribute.value.value;

        const failedSnakeCaseMessage = enforceConsistentSnakeCase
          ? getFailedSnakeCaseMessage(nodeName, mappedName)
          : undefined;
        const failedRegexMessage = getFailedRegexMessage(mappedName, regexList);
        if (failedSnakeCaseMessage || failedRegexMessage) {
          context.report({
            node,
            message: [failedSnakeCaseMessage, failedRegexMessage]
              .filter(Boolean)
              .join("\n"),
          });
        }
      },
    };
  },
} satisfies RuleDefinition;

function getFailedRegexMessage(
  mappedName: string,
  regexList: string[]
): string | undefined {
  const failedRegexes = regexList.filter((regex) => {
    return !new RegExp(regex).test(mappedName);
  });
  return failedRegexes
    .map((regex) => `Expected mapped model name to match "${regex}".`)
    .join("\n");
}

function getFailedSnakeCaseMessage(
  nodeName: string,
  mappedName: string
): string | undefined {
  const expectedSnakeCase = getConsistentSnakeCase(nodeName);
  if (mappedName !== expectedSnakeCase) {
    return (
      `Expected mapped model name to be snake case consistent ` +
      `with the model name "${expectedSnakeCase}".`
    );
  }
  return "";
}
