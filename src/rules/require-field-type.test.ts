import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import requireFieldType from '#src/rules/require-field-type.js';

describe('require-field-type', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      config: {
        rules: {
          'require-field-type': ['error', config],
        },
      },
      ruleDefinitions: [requireFieldType],
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
