import { Context, PrismaPropertyType } from "src/util";
import { Model } from "@mrleebo/prisma-ast";
import * as pluralize from "pluralize";

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
