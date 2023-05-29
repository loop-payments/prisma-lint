import type { RuleDefinition } from '#src/common/rule.js';

type RuleName = string;
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

export type Rule = { ruleConfig: RuleConfig; ruleDefinition: RuleDefinition };

export const parseRules = (
  ruleDefinitions: RuleDefinition[],
  config: PrismaLintConfig,
): { rules: Rule[]; parseIssues: string[] } => {
  const rules: Rule[] = [];
  const parseIssues: string[] = [];
  const rawRuleValues = config.rules;
  const ruleDefinitionMap = new Map(
    ruleDefinitions.map((d) => [d.ruleName, d]),
  );
  const sortedRuleNames = Object.keys(rawRuleValues).sort();
  for (const ruleName of sortedRuleNames) {
    const ruleDefinition = ruleDefinitionMap.get(ruleName);
    if (ruleDefinition == null) {
      parseIssues.push(`Unable to find rule for ${ruleName}`);
      continue;
    }
    const rawRuleValue = rawRuleValues[ruleName];
    if (getRuleLevel(rawRuleValue) === 'off') {
      continue;
    }
    const rawRuleConfig = getRuleConfig(rawRuleValue);
    const parsed = ruleDefinition.configSchema.safeParse(rawRuleConfig);
    if (parsed.success) {
      rules.push({
        ruleConfig: parsed.data,
        ruleDefinition,
      });
    } else {
      const issues = parsed.error.issues.map((issue) => issue.message);
      if (issues.length > 1 && issues[0] === 'Required') {
        issues.shift();
      }
      const parseIssue = [
        `Failed to parse config for rule '${ruleName}':`,
        `  ${issues.join(',')}`,
      ].join('\n');
      parseIssues.push(parseIssue);
    }
  }
  return { rules, parseIssues };
};
