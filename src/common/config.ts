export type RuleName = string;
export type RuleConfig = Record<string, unknown>;
export type RuleConfigLevel = 'error' | 'off';
export type RuleConfigValue =
  | RuleConfigLevel
  | [RuleConfigLevel]
  | [RuleConfigLevel, RuleConfig | undefined];

export type PrismaLintConfig = {
  rules: Record<RuleName, RuleConfigValue>;
  plugins?: string[];
};

export function getRuleLevel(value: RuleConfigValue) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getRuleConfig(value: RuleConfigValue) {
  if (Array.isArray(value)) {
    return value[1] ?? {};
  }
  return {};
}
