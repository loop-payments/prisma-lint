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

export const RuleConfigParseError = class extends Error {
  constructor(ruleName: string, config: unknown, zodIssues: z.ZodIssue[]) {
    if (zodIssues.length > 1 && zodIssues[0].message === 'Required') {
      zodIssues = zodIssues.slice(1);
    }
    const message = [
      `Failed to parse config for rule '${ruleName}'`,
      `  Value: '${JSON.stringify(config)}'`,
      `  ${zodIssues.map((issue) => issue.message).join(',')}`,
    ].join('\n');
    super(message);
    this.name = 'RuleConfigParseError';
  }
};

export const parseRuleConfig = function <T>(
  ruleName: string,
  schema: z.ZodSchema<T>,
  config: unknown,
): T {
  if (config == null && schema.isOptional()) {
    return undefined as T;
  }
  const parsed = schema.safeParse(config);
  if (parsed.success) {
    return parsed.data;
  }
  throw new RuleConfigParseError(ruleName, config, parsed.error.issues);
};
