import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import requireFieldType from '#src/rules/require-field-type.js';

describe('require-field-type', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'require-field-type': ['error', config],
        },
      },
      ruleRegistry: {
        'require-field-type': requireFieldType,
      },
    });

  describe('string literal field name', () => {
    const run = getRunner({
      require: [{ ifName: 'id', type: 'String' }],
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
      require: [{ ifName: /At$/, type: 'DateTime' }],
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
      require: [{ ifName: '/At$/', type: 'DateTime' }],
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
