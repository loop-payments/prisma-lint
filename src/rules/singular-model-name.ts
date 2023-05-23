import {
  type Context,
  PrismaPropertyType,
  type RuleDefinition,
} from "../util.js";
import type { Model } from "@mrleebo/prisma-ast";
import pluralize from "pluralize";

export default {
  meta: {
    defaultDescription: "Expected singular model name.",
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
} satisfies RuleDefinition;
