import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import forbidField from '#src/rules/forbid-field.js';

describe('forbid-field', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'forbid-field': ['error', config],
        },
      },
      ruleDefinitions: [forbidField],
    });

  describe('forbidding with parameterized comment', () => {
    const run = getRunner({
      forbid: ['id'],
    });

    describe('with parameterized comment', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        /// prisma-lint-ignore-model forbid-field id
        id String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });
  });

  describe('forbidding id field with string', () => {
    const run = getRunner({
      forbid: ['id'],
    });

    describe('with uuid', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        uuid String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with id', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex d6 fields without amount', () => {
    const run = getRunner({
      forbid: ['/^(?!.*[aA]mountD6$).*D6$/'],
    });

    describe('with amount d6', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model Product {
        priceAmountD6 Int
        amountD6 Int
        otherAmountD6 Int
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without amount prefix', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Product {
        priceD6 Int
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('ignore comments', () => {
    const run = getRunner({
      forbid: ['id'],
    });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-model forbid-field
          id String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-model
          id String
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('respects field-specific ignore comments', async () => {
      const violations = await run(`
        model User {
          /// prisma-lint-ignore-field forbid-field
          id String
        }
      `);
      expect(violations.length).toEqual(0);
    });
  });
});
