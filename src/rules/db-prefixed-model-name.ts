import type { Context } from "../util.js";
import type { Model } from "@mrleebo/prisma-ast";
import type { RuleDefinition } from "../util.js";

export default {
  meta: {
    defaultDescription: "Expected model name to start with 'Db'.",
  },
  create: (context: Context) => {
    return {
      Model: (node: Model) => {
        const { name } = node;
        if (!name.startsWith("Db")) {
          context.report({ node });
        }
      },
    };
  },
} satisfies RuleDefinition;
