import {
  parseRuleConfigList,
  type PrismaLintConfig,
} from '#src/common/config.js';
import type { RuleRegistry } from '#src/common/rule.js';
import { lintPrismaSourceCode } from '#src/lint.js';

export async function testLintPrismaSource({
  ruleRegistry,
  config,
  fileName,
  sourceCode,
}: {
  ruleRegistry: RuleRegistry;
  config: PrismaLintConfig;
  fileName: string;
  sourceCode: string;
}) {
  const { ruleConfigList, parseIssues } = parseRuleConfigList(
    ruleRegistry,
    config,
  );
  if (parseIssues.length > 0) {
    throw new Error(
      `Unable to parse test config for ${fileName}:\n${parseIssues
        .map((issue) => `  ${issue}`)
        .join('\n')}`,
    );
  }
  const violations = await lintPrismaSourceCode({
    sourceCode,
    fileName,
    ruleConfigList,
    ruleRegistry,
  });
  return violations;
}
