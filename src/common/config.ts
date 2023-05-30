export type RootConfig = {
  rules: Record<RuleName, RuleConfigValue>;
};

type RuleName = string;

type RuleConfigValue =
  | RuleConfigLevel
  | [RuleConfigLevel]
  | [RuleConfigLevel, RuleConfig | undefined];

type RuleConfigLevel = 'error' | 'off';
export type RuleConfig = Record<string, unknown>;

export function getRuleLevel(value: RuleConfigValue): RuleConfigLevel {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getRuleConfig(value: RuleConfigValue): RuleConfig {
  if (Array.isArray(value)) {
    return value[1] ?? {};
  }
  return {};
}
