import type { Context } from "../util.js";
import type { Model } from "@mrleebo/prisma-ast";
import type { RuleDefinition } from "../util.js";

export default {
  meta: {
    defaultDescription: "Expected snake case model mapping.",
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
