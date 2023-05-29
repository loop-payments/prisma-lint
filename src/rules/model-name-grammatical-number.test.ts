import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import modelNameGrammaticalNumber from '#src/rules/model-name-grammatical-number.js';

describe('model-name-grammatical-number', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      config: {
        rules: {
          'model-name-grammatical-number': ['error', config],
        },
      },
      ruleRegistry: {
        'model-name-grammatical-number': modelNameGrammaticalNumber,
      },
    });

  describe('ignore comments', () => {
    const run = getRunner({ style: 'singular' });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
    model Users {
      /// prisma-lint-ignore-model model-name-grammatical-number
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

  describe('expecting singular', () => {
    const run = getRunner({ style: 'singular' });

    describe('singular', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('plural', () => {
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

  describe('expecting plural', () => {
    const run = getRunner({ style: 'plural' });
    describe('singular', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('plural', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model Users {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });
  });
});
