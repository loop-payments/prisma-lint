import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import forbiddenField from '#src/rules/forbidden-field.js';

describe('forbidden-field', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'forbidden-field': ['error', config],
        },
      },
      ruleRegistry: {
        'forbidden-field': forbiddenField,
      },
    });

  describe('forbidding id field with string', () => {
    const run = getRunner({
      forbidden: ['id'],
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
      forbidden: ['/^(?!.*[a|A]mountD6$).*D6$/'],
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
});
