import type { Model, Schema } from "@mrleebo/prisma-ast";
import { Enum } from "@kejistan/enum";

export function listModelBlocks(schema: Schema) {
  return schema.list.filter((block): block is Model => block.type === "model");
}

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

export const PrismaPropertyType = Enum({
  FIELD: "field",
  ATTRIBUTE: "attribute",
  COMMENT: "comment",
});

export type RuleConfigLevel = "error" | "off";
export type RuleConfigValue = Record<string, unknown>;
export type RuleConfig = RuleConfigLevel | [RuleConfigLevel, RuleConfigValue];

export type PrismaLintConfig = {
  rules: Record<string, RuleConfig>;
  plugins?: string[];
};

/**
 * Context passed to rules.
 */
export type Context = {
  fileName: string;
  report: (violation: ReportedViolation) => void;
};

/**
 * A "draft" violation, as reported by a rule.
 */
export type ReportedViolation = { node: Model; message?: string };

/**
 * Full violation, as returned by the linter.
 */
export type Violation = {
  /** The name of the rule. */
  ruleName: string;

  /**
   * The node with the violation.
   * Currently only Model nodes are supported.
   */
  node: Model;

  /** Description of the violation and possibly how to fix. */
  message: string;
};

export type RuleInstance = {
  Model: (model: Model) => void;
};

export type RuleDefinition = {
  meta: {
    defaultMessage: string | undefined;
  };
  create: (config: RuleConfigValue, context: Context) => RuleInstance;
};

export type RuleRegistry = Record<string, RuleDefinition>;
