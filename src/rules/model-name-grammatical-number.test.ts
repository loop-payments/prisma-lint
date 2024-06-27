import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import modelNameGrammaticalNumber from '#src/rules/model-name-grammatical-number.js';

describe('model-name-grammatical-number', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'model-name-grammatical-number': ['error', config],
        },
      },
      ruleDefinitions: [modelNameGrammaticalNumber],
    });

  describe('ignore comments', () => {
    const run = getRunner({ style: 'singular' });

    it('respects rule-specific ignore comments', async () => {
      const { violations } = await run(`
    model Users {
      /// prisma-lint-ignore-model model-name-grammatical-number
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const { violations } = await run(`
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
        const { violations } = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('plural', () => {
      it('returns violation', async () => {
        const { violations } = await run(`
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
        const { violations } = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('plural', () => {
      it('returns no violations', async () => {
        const { violations } = await run(`
      model Users {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });
  });

  describe('allowlist', () => {
    describe('without allowlist', () => {
      const run = getRunner({ style: 'singular' });

      it('returns violation', async () => {
        const { violations } = await run(`
      model UserData {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with string allowlist', () => {
      const run = getRunner({ style: 'singular', allowlist: ['UserData'] });

      it('returns no violations', async () => {
        const { violations } = await run(`
      model UserData {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with regexp allowlist', () => {
      const run = getRunner({ style: 'singular', allowlist: ['/Data$/'] });

      describe('with matching suffix', () => {
        it('returns no violations', async () => {
          const { violations } = await run(`
      model UserData {
        id String @id
      }
      model TenantData {
        id String @id
      }
    `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('without matching suffix', () => {
        it('returns violation', async () => {
          const { violations } = await run(`
      model DataRecords {
        id String @id
      }
    `);
          expect(violations.length).toEqual(1);
        });
      });
    });
  });
});
