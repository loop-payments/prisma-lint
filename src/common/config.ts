import type { RuleRegistry } from '#src/common/rule.js';

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

export type RuleConfigList = [RuleName, RuleConfig][];

export const parseRuleConfigList = (
  config: PrismaLintConfig,
  ruleRegistry: RuleRegistry,
): { ruleConfigList: RuleConfigList; parseIssues: string[] } => {
  const ruleConfigList: [RuleName, RuleConfig][] = [];
  const parseIssues: string[] = [];
  const rawRuleValues = config.rules;
  const sortedRuleNames = Object.keys(rawRuleValues).sort();
  for (const ruleName of sortedRuleNames) {
    const ruleDefinition = ruleRegistry[ruleName];
    if (ruleDefinition == null) {
      parseIssues.push(`Unable to find rule for ${ruleName}`);
    }
    const rawRuleValue = rawRuleValues[ruleName];
    if (getRuleLevel(rawRuleValue) === 'off') {
      continue;
    }
    const rawRuleConfig = getRuleConfig(rawRuleValue);
    const parsed = ruleDefinition.configSchema.safeParse(rawRuleConfig);
    if (parsed.success) {
      ruleConfigList.push([ruleName, parsed.data]);
    } else {
      const parseIssue = [
        `Failed to parse config for rule '${ruleName}':`,
        `  ${parsed.error.issues.map((issue) => issue.message).join(',')}`,
      ].join('\n');
      parseIssues.push(parseIssue);
    }
  }
  return { ruleConfigList, parseIssues };
};
