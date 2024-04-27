import type { RuleConfig } from '#src/common/config.js';
import { printPrismaSchema } from '#src/common/print-prisma-schema.js';
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
        const { violations } = await run(`
    model Post {
      tags String[] @default([])
    }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('no default', () => {
      it('returns violations', async () => {
        const { violations } = await run(`
      model Post {
        tags String[]
      }
    `);
        expect(violations.length).toEqual(1);
      });

      it('returns fix', async () => {
        const { violations, prismaSchema } = await run(`
      model Post {
        tags String[]
      }
    `);
        expect(violations.length).toEqual(1);
        const violation = violations[0];
        const { fix, field } = violation;
        if (fix == null || field == null) {
          throw new Error('fail');
        }
        fix();
        const fixed = printPrismaSchema(prismaSchema);
        expect(fixed.trim()).toEqual(
          `
model Post {
  tags String[] @default([])
}`.trim(),
        );
      });
    });

    describe('non-array default', () => {
      it('returns violations', async () => {
        const { violations } = await run(`
      model Post {
        tags String[] @default("foo")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('not empty array default', () => {
      it('returns violations', async () => {
        const { violations } = await run(`
      model Post {
        tags String[] @default(["foo"])
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
