import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import enumNamePascalCase from '#src/rules/enum-name-pascal-case.js';

describe('enum-name-pascal-case', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'enum-name-pascal-case': ['error', config],
        },
      },
      ruleDefinitions: [enumNamePascalCase],
    });

  describe('ignore comments', () => {
    const run = getRunner();

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
    enum exampleOptions {
      /// prisma-lint-ignore-enum enum-name-pascal-case
      value1
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
    enum exampleOptions {
      /// prisma-lint-ignore-enum
      value1
    }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('without config', () => {
    const run = getRunner();

    describe('single word', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      enum Example {
        value1
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('compound word in PascalCase', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      enum ExampleOptions {
        value1
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('first character is not uppercase', () => {
      it('returns violation', async () => {
        const violations = await run(`
      enum exampleOptions {
        value1
      }
      `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('contains underscore', () => {
      it('returns violation', async () => {
        const violations = await run(`
      enum example_options {
        value1
      }
      `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('permits digits anywhere', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      enum Exampl3O0ptions {
        value1
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
    enum exampleOptions {
      value1
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('allowList string requires full match', async () => {
      const violations = await run(`
      enum exampleOptionsWithSuffix {
        value1
      }
    `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with allowlist regexp', () => {
    const run = getRunner({ allowList: [/^db.*/] });

    it('returns no violations', async () => {
      const violations = await run(`
      enum db_exampleOptions {
        value1
      }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('with trimPrefix single string', () => {
    const run = getRunner({ trimPrefix: 'db' });

    it('returns no violations', async () => {
      const violations = await run(`
      enum dbExampleOptions {
        value1
      }
    `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix must be PascalCase', async () => {
      const violations = await run(`
      enum dbcamelCase {
        value1
      }
    `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with trimPrefix single regexp', () => {
    const run = getRunner({ trimPrefix: /^db/ });

    it('returns no violations', async () => {
      const violations = await run(`
      enum dbExampleOptions {
        value1
      }
    `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix must be PascalCase', async () => {
      const violations = await run(`
      enum dbcamelCase {
        value1
      }
    `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with trimPrefix array', () => {
    const run = getRunner({ trimPrefix: ['db', /^eg/] });

    it('returns no violations for first prefix', async () => {
      const violations = await run(`
      enum dbExampleOptions {
        value1
      }
    `);
      expect(violations.length).toEqual(0);
    });

    it('returns no violations for second prefix', async () => {
      const violations = await run(`
      enum egExampleOptions {
        value1
      }
      `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix after string must be PascalCase', async () => {
      const violations = await run(`
      enum dbexampleOptions {
        value1
      }
    `);
      expect(violations.length).toEqual(1);
    });

    it('remaining suffix after regexp must be PascalCase', async () => {
      const violations = await run(`
      enum egexampleOptions {
        value1
      }
      `);
      expect(violations.length).toEqual(1);
    });
  });
});
