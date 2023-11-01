import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import forbidRequiredIgnoredField from '#src/rules/forbid-required-ignored-field.js';

describe('forbid-required-ignored-field', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'forbid-required-ignored-field': ['error', config],
        },
      },
      ruleDefinitions: [forbidRequiredIgnoredField],
    });

  describe('forbidding', () => {
    const run = getRunner({ allowIgnoreWithDefault: false });

    describe('with optional ignored field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String
        toBeRemoved String? @ignore
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with required ignored field', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String
        toBeRemoved String @ignore
      }
    `);
        expect(violations.length).toEqual(1);
      });

      describe('with required ignored field', () => {
        it('returns violation', async () => {
          const violations = await run(`
      model Users {
        id String
        toBeRemoved String @ignore @default(false)
      }
    `);
          expect(violations.length).toEqual(1);
        });
      });
    });

    describe('allowIgnoreWithDefault configuration', () => {
      describe('allowIgnoreWithDefault false', () => {
        const run = getRunner({ allowIgnoreWithDefault: false });
        it('returns violation for an ignored field with a default', async () => {
          const violations = await run(`
      model Users {
        id String
        toBeRemoved String @ignore @default(false)
      }
    `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('allowIgnoreWithDefault true', () => {
        const run = getRunner({ allowIgnoreWithDefault: true });
        it('returns no violations for an ignored field with a default', async () => {
          const violations = await run(`
      model Users {
        id String
        toBeRemoved String @ignore @default(false)
      }
    `);
          expect(violations.length).toEqual(0);
        });
      });
    });
  });
});
