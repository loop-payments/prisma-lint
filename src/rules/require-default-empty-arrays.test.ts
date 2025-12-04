import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import requireDefaultEmptyArrays from '#src/rules/require-default-empty-arrays.js';

describe('require-default-empty-arrays', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'require-default-empty-arrays': ['error', config],
        },
      },
      ruleDefinitions: [requireDefaultEmptyArrays],
    });

  describe('without config', () => {
    const run = getRunner();

    describe('valid default empty array', () => {
      it('returns no violations', async () => {
        const violations = await run(`
    model Post {
     tags String[] @default([])
    }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('no default', () => {
      it('returns violations', async () => {
        const violations = await run(`
      model Post {
        tags String[]
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('non-array default', () => {
      it('returns violations', async () => {
        const violations = await run(`
      model Post {
        tags String[] @default("foo")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('not empty array default', () => {
      it('returns violations', async () => {
        const violations = await run(`
      model Post {
        tags String[] @default(["foo"])
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('ignore comments', () => {
    const run = getRunner();

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        model Post {
          /// prisma-lint-ignore-model require-default-empty-arrays
          tags String[]
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
        model Post {
          /// prisma-lint-ignore-model
          tags String[]
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('respects field-specific ignore comments', async () => {
      const violations = await run(`
        model Post {
          /// prisma-lint-ignore-field require-default-empty-arrays
          tags String[]
        }
      `);
      expect(violations.length).toEqual(0);
    });
  });
});
