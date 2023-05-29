import {
  getRuleConfig,
  getRuleLevel,
  type RootConfig,
} from '#src/common/config.js';
import type { Rule, RuleDefinition } from '#src/common/rule.js';

export const parseRules = (
  ruleDefinitions: RuleDefinition[],
  rootConfig: RootConfig,
): { rules: Rule[]; parseIssues: string[] } => {
  const rules: Rule[] = [];
  const parseIssues: string[] = [];
  const rawRuleValues = rootConfig.rules;
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
