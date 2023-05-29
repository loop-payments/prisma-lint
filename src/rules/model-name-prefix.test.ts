import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import modelNamePrefix from '#src/rules/model-name-prefix.js';

describe('model-name-prefix', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'model-name-prefix': ['error', config],
        },
      },
      ruleRegistry: {
        'model-name-prefix': modelNamePrefix,
      },
    });

  describe('ignore comments', () => {
    const run = getRunner({ prefix: 'Db' });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
    model Users {
      /// prisma-lint-ignore-model model-name-prefix
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
    model Users {
      /// prisma-lint-ignore-model
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('expecting Db', () => {
    const run = getRunner({ prefix: 'Db' });

    describe('with prefix', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model DbUser {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without prefix', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
