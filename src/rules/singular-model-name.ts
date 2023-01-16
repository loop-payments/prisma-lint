import { Context, PrismaPropertyType } from "src/util";
import { Model } from "@mrleebo/prisma-ast";
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
          return false;
        }
        if (pluralize.isPlural(node.name)) {
          context.report({ node });
        }
      },
    };
  },
};
