import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import fieldNameCamelCase from '#src/rules/field-name-camel-case.js';

describe('ignore-field', () => {
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

  describe('edge cases', () => {
    it('works with multiple consecutive comment lines', async () => {
      const violations = await run(`
        model User {
          /// Some documentation comment
          /// prisma-lint-ignore-field field-name-camel-case
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('does not ignore field when blank line breaks comment chain', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field field-name-camel-case

          user_name String
        }
      `);
      expect(violations.length).toEqual(1);
    });

    it('does not ignore field when non-comment line breaks chain', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field field-name-camel-case
          id String @id
          user_name String
        }
      `);
      expect(violations.length).toEqual(1);
    });

    it('only applies to immediately following field', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field field-name-camel-case
          user_name String
          user_email String
        }
      `);
      expect(violations.length).toEqual(1);
      expect(violations[0].field?.name).toBe('user_email');
    });

    it('works for first field in model', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field field-name-camel-case
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('does not apply when comment is after field', async () => {
      const violations = await run(`
        model User {
          user_name String
          /// prisma-lint-ignore-field field-name-camel-case
        }
      `);
      expect(violations.length).toEqual(1);
    });

    it('handles extra whitespace in rule names', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field   field-name-camel-case   
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('handles tabs in rule names', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field\tfield-name-camel-case
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('is case-sensitive for rule names', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field Field-Name-Camel-Case
          user_name String
        }
      `);
      expect(violations.length).toEqual(1);
    });

    it('handles trailing commas gracefully', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field field-name-camel-case,
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('handles double commas gracefully', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field other-rule,,field-name-camel-case
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('works with documentation comment before ignore comment', async () => {
      const violations = await run(`
        model User {
          /// This is the user's name
          /// prisma-lint-ignore-field field-name-camel-case
          user_name String
        }
      `);
      expect(violations.length).toEqual(0);
    });
  });
});
