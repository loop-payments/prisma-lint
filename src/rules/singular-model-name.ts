import { Context, PrismaPropertyType } from "../util.js";
import type { Model } from "@mrleebo/prisma-ast";
import * as pluralize from "pluralize";

export default {
  meta: {
    description: "Expected singular model name.",
  },
  create: (context: Context) => {
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
        if (pluralize.isPlural(node.name)) {
          context.report({ node });
        }
      },
    };
  },
};
