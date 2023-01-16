import type { Context } from "src/util.js";
import type { Model } from "@mrleebo/prisma-ast";

export default {
  meta: {
    description: "Expected model name to start with 'Db'.",
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
};
