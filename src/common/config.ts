import { z } from 'zod';

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

const errorMap: z.ZodErrorMap = (issue) => {
  if (issue.code === z.ZodIssueCode.invalid_type && issue.path.length === 0) {
    return { message: 'A rule configuration is require' };
  }
  return { message: 'Invalid rule configuration' };
};

export const RULE_CONFIG_PARSE_PARAMS = { errorMap };
