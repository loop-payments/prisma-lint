import type { RuleConfig } from '#src/common/config.js';
import { getExpectSchemaFix, testLintPrismaSource } from '#src/common/test.js';
import modelNamePrefix from '#src/rules/model-name-prefix.js';

describe('model-name-prefix', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'model-name-prefix': ['error', config],
        },
      },
      ruleDefinitions: [modelNamePrefix],
    });

  describe('ignore comments', () => {
    const run = getRunner({ prefix: 'Db' });

    it('respects rule-specific ignore comments', async () => {
      const { violations } = await run(`
    model Users {
      /// prisma-lint-ignore-model model-name-prefix
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

  describe('expecting Db', () => {
    const run = getRunner({ prefix: 'Db' });
    const expectSchemaFix = getExpectSchemaFix(run);

    describe('with prefix', () => {
      it('returns no violations', async () => {
        const { violations } = await run(`
      model DbUser {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without prefix', () => {
      it('returns violation', async () => {
        const { violations } = await run(`
      model Users {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });

      it('fixes by adding prefix', async () => {
        await expectSchemaFix(
          `
// A comment on the model.
/// A three-slash comment on the model.
model User {
  // An inline comment on the field.
  /// A three-slash comment on the field.
  id String @id
}

// A comment below the model.
---
// A comment on the model.
/// A three-slash comment on the model.

model DbUser {
  // An inline comment on the field.
  /// A three-slash comment on the field.
  id String @id
}

// A comment below the model.
`,
        );
      });
    });
  });
});
