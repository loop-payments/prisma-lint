import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import fieldNameCamelCase from '#src/rules/field-name-camel-case.js';

describe('ignore-line', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'field-name-camel-case': ['error', config],
        },
      },
      ruleDefinitions: [fieldNameCamelCase],
    });

  const run = getRunner({});

  it('respects ignore line for field rule', async () => {
    const violations = await run(`
      model User {
        /// prisma-lint-ignore-field field-name-camel-case
        user_name String
      }
    `);
    expect(violations.length).toEqual(0);
  });

  it('reports violation without ignore line', async () => {
    const violations = await run(`
      model User {
        user_name String
      }
    `);
    expect(violations.length).toEqual(1);
  });

  it('respects bare ignore line (ignores all)', async () => {
    const violations = await run(`
      model User {
        /// prisma-lint-ignore-field
        user_name String
      }
    `);
    expect(violations.length).toEqual(0);
  });

  it('respects ignore line with multiple rules', async () => {
    const violations = await run(`
      model User {
        /// prisma-lint-ignore-field other-rule field-name-camel-case
        user_name String
      }
    `);
    expect(violations.length).toEqual(0);
  });

  it('respects ignore line with comma-separated rules', async () => {
    const violations = await run(`
      model User {
        /// prisma-lint-ignore-field other-rule,field-name-camel-case
        user_name String
      }
    `);
    expect(violations.length).toEqual(0);
  });

  it('respects ignore line with mixed space and comma separated rules', async () => {
    const violations = await run(`
      model User {
        /// prisma-lint-ignore-field other-rule, field-name-camel-case
        user_name String
      }
    `);
    expect(violations.length).toEqual(0);
  });
});
