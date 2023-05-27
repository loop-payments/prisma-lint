import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import requiredFieldType from '#src/rules/required-field-type.js';

describe('required-field-type', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'required-field-type': ['error', config],
        },
      },
      ruleRegistry: {
        'required-field-type': requiredFieldType,
      },
    });

  describe('string literal field name', () => {
    const run = getRunner({
      requirements: [{ fieldName: 'id', fieldType: 'String' }],
    });

    describe('correct type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex field name', () => {
    const run = getRunner({
      requirements: [{ fieldName: /At$/, fieldType: 'DateTime' }],
    });

    describe('correct type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        createdAt DateTime
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        createdAt Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex string field name', () => {
    const run = getRunner({
      requirements: [{ fieldName: '/At$/', fieldType: 'DateTime' }],
    });

    describe('correct type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        createdAt DateTime
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        createdAt Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
