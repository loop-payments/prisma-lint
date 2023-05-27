import type { Model } from "@mrleebo/prisma-ast";
import { PrismaPropertyType } from "./prisma.js";

const IGNORE_MODEL = "/// prisma-lint-ignore-model";

export function listIgnoreModelComments(node: Model) {
  const commentFields = node.properties.filter(
    (p: any) => p.type === PrismaPropertyType.COMMENT
  ) as any[];
  return commentFields
    .map((f) => f.text.trim())
    .filter((t) => t.startsWith(IGNORE_MODEL));
}

export function isModelEntirelyIgnored(ignoreModelComments: string[]) {
  return ignoreModelComments.includes(IGNORE_MODEL);
}

export function isRuleIgnored(ruleName: string, ignoreModelComments: string[]) {
  return ignoreModelComments.includes(`${IGNORE_MODEL} ${ruleName}`);
}
