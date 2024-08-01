import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import enumValueSnakeCase from '#src/rules/enum-value-snake-case.js';

describe('enum-value-snake-case', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'enum-value-snake-case': ['error', config],
        },
      },
      ruleDefinitions: [enumValueSnakeCase],
    });

  describe('ignore comments', () => {
    const run = getRunner();

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum enum-value-snake-case
          PascalCase
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum
          PascalCase
        }
        `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('without config', () => {
    const run = getRunner();

    describe('single lowercase word', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          enum Example {
            value
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('digit requires underscore', () => {
      it('returns violation', async () => {
        const violations = await run(`
            enum Example {
              value1
            }
          `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('digit allowed after underscore', () => {
      it('returns no violations', async () => {
        const violations = await run(`
              enum Example {
                value_1
              }
            `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('compound word in PascalCase', () => {
      it('returns violations', async () => {
        const violations = await run(`
          enum Example {
            ExampleValue
          }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('first character is uppercase', () => {
      it('returns violation', async () => {
        const violations = await run(`
          enum Example {
            Value
          }
          `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('compound word in valid snake case', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          enum Example {
            example_option
          }
          `);
        expect(violations.length).toEqual(0);
      });
    });
  });

  describe('with allowlist string', () => {
    const run = getRunner({ allowList: ['exampleOptions'] });

    it('returns no violations', async () => {
      const violations = await run(`
        enum Example {
          exampleOptions
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('allowList string requires full match', async () => {
      const violations = await run(`
        enum Example {
          exampleOptionsWithSuffix
        }
        `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with allowlist regexp', () => {
    const run = getRunner({ allowList: [/^DB.*/] });

    it('returns no violations', async () => {
      const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('with trimPrefix single string', () => {
    const run = getRunner({ trimPrefix: 'DB' });

    it('returns no violations', async () => {
      const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix must be snake_case', async () => {
      const violations = await run(`
        enum Example {
          dbExampleOptions
        }
        `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with trimPrefix single regexp', () => {
    const run = getRunner({ trimPrefix: /^DB/ });

    it('returns no violations', async () => {
      const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix must be snake_case', async () => {
      const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with trimPrefix array', () => {
    const run = getRunner({ trimPrefix: ['DB', /^EG/] });

    it('returns no violations for first prefix', async () => {
      const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('returns no violations for second prefix', async () => {
      const violations = await run(`
        enum Example {
          EGexample_options
        }
          `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix after string must be snake_case', async () => {
      const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
      expect(violations.length).toEqual(1);
    });

    it('remaining suffix after regexp must be snake_case', async () => {
      const violations = await run(`
        enum Example {
          EGexampleOptions
        }
          `);
      expect(violations.length).toEqual(1);
    });
  });
});
