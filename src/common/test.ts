import { type PrismaLintConfig } from '#src/common/config.js';
import { parseRules } from '#src/common/parse-rules.js';
import type { RuleDefinition } from '#src/common/rule.js';
import { lintPrismaSourceCode } from '#src/lint.js';

export async function testLintPrismaSource({
  ruleDefinitions,
  config,
  fileName,
  sourceCode,
}: {
  ruleDefinitions: RuleDefinition[];
  config: PrismaLintConfig;
  fileName: string;
  sourceCode: string;
}) {
  const { rules, parseIssues } = parseRules(ruleDefinitions, config);
  if (parseIssues.length > 0) {
    throw new Error(
      `Unable to parse test config for ${fileName}:\n${parseIssues
        .map((issue) => `  ${issue}`)
        .join('\n')}`,
    );
  }
  const violations = await lintPrismaSourceCode({
    rules,
    fileName,
    sourceCode,
  });
  return violations;
}
