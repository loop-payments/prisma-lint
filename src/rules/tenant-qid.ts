import type { Model } from "@mrleebo/prisma-ast";

import {
  type Context,
  PrismaPropertyType,
  type RuleDefinition,
} from "#src/util.js";

/**
 * Warns if `tenantQid` is not the first field in the model.
 */
export default {
  meta: {
    defaultMessage: undefined,
  },
  create: (context: Context) => {
    return {
      Model: (node: Model) => {
        const commentFields = node.properties.filter(
          (p: any) => p.type === PrismaPropertyType.COMMENT
        );
        const omitComment =
          commentFields[0] &&
          (commentFields[0] as any).text === "///no-tenant-field";
        if (omitComment) {
          return;
        }

        const tenantFields = node.properties
          .filter((p: any) => p.type === PrismaPropertyType.FIELD)
          .map((v: any, i: number) => [v, i])
          .filter(([v]: any[]) => v.name === "tenantQid");
        if (tenantFields[0] == null) {
          context.report({
            node,
            message:
              "Expected tenantQid field to be the first field or have the " +
              "///no-tenant-field comment in the model.",
          });
        } else if (tenantFields[0][1] !== 0) {
          context.report({
            node,
            message:
              "Expected tenantQid field to be the first field in the model.",
          });
        }
      },
    };
  },
} satisfies RuleDefinition;
