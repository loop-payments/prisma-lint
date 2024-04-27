import { type RootConfig } from '#src/common/config.js';
import type { PrismaSchema } from '#src/common/get-prisma-schema.js';
import { parseRules } from '#src/common/parse-rules.js';
import { printPrismaSchema } from '#src/common/print-prisma-schema.js';
import type { RuleDefinition } from '#src/common/rule.js';
import type { Violation } from '#src/common/violation.js';
import { lintPrismaSourceCode } from '#src/lint-prisma-source-code.js';

export async function testLintPrismaSource({
  ruleDefinitions,
  rootConfig,
  fileName,
  sourceCode,
}: {
  ruleDefinitions: RuleDefinition[];
  rootConfig: RootConfig;
  fileName: string;
  sourceCode: string;
}) {
  const { rules, parseIssues } = parseRules(ruleDefinitions, rootConfig);
  if (parseIssues.length > 0) {
    throw new Error(
      `Unable to parse test config for ${fileName}:\n${parseIssues
        .map((issue) => `  ${issue}`)
        .join('\n')}`,
    );
  }
  const { violations, prismaSchema } = lintPrismaSourceCode({
    rules,
    fileName,
    sourceCode,
  });

  return { violations, prismaSchema };
}

export function getExpectSchemaFix(
  run: (sourceCode: string) => Promise<{
    violations: Violation[];
    prismaSchema: PrismaSchema;
  }>,
) {
  return async (input: string) => {
    const [original, fixed] = input.split('---');
    const { violations, prismaSchema } = await run(original);
    expect(violations.length).toEqual(1);
    expectViolationFix(violations[0], prismaSchema, fixed);
  };
}

export function expectViolationFix(
  violation: Violation,
  prismaSchema: PrismaSchema,
  result: string,
) {
  const { fix } = violation;
  if (fix == null) {
    throw new Error('Expected fix function!');
  }
  fix();
  const fixed = printPrismaSchema(prismaSchema);
  expect(fixed.trim()).toEqual(result.trim());
}
