import {
  parseRuleConfigList,
  type PrismaLintConfig,
} from '#src/common/config.js';
import type { RuleRegistry } from '#src/common/rule.js';
import { lintPrismaSource } from '#src/lint.js';

export async function testLintPrismaSource({
  fileName,
  schemaSource,
  config,
  ruleRegistry,
}: {
  fileName: string;
  schemaSource: string;
  config: PrismaLintConfig;
  ruleRegistry: RuleRegistry;
}) {
  const { ruleConfigList, parseIssues } = parseRuleConfigList(
    config,
    ruleRegistry,
  );
  if (parseIssues.length > 0) {
    throw new Error(
      `Unable to parse test config for ${fileName}:\n${parseIssues
        .map((issue) => `  ${issue}`)
        .join('\n')}`,
    );
  }
  const violations = await lintPrismaSource({
    schemaSource,
    fileName,
    ruleConfigList,
    ruleRegistry,
  });
  return violations;
}
