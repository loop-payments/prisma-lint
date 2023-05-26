export type RuleName = string;
export type RuleConfig = Record<string, unknown>;
export type RuleConfigLevel = "error" | "off";
export type RuleConfigValue = RuleConfigLevel | [RuleConfigLevel, RuleConfig];

export type PrismaLintConfig = {
  rules: Record<RuleName, RuleConfigValue>;
  plugins?: string[];
};
