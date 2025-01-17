import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import listFieldNameGrammaticalNumber from '#src/rules/field-name-grammatical-number.js';

describe('field-name-grammatical-number', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'field-name-grammatical-number': ['error', config],
        },
      },
      ruleDefinitions: [listFieldNameGrammaticalNumber],
    });

  describe('expecting singular', () => {
    const run = getRunner({ ifList: 'singular' });

    describe('singular', () => {
      it('returns no violations for singular list field', async () => {
        const violations = await run(`
      model User {
        email String[]
      }
    `);
        expect(violations.length).toEqual(0);
      });

      it('ignores non-list fields', async () => {
        const violations = await run(`
      model User {
        emails String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('plural', () => {
      it('returns violation for plural list field', async () => {
        const violations = await run(`
      model User {
        emails String[]
      }
    `);
        expect(violations.length).toEqual(1);
        expect(violations[0].message).toEqual(
          'Expected singular name for list field.',
        );
      });
    });
  });

  describe('expecting plural', () => {
    const run = getRunner({ ifList: 'plural' });

    describe('singular', () => {
      it('returns violation for singular list field', async () => {
        const violations = await run(`
      model User {
        email String[]
      }
    `);
        expect(violations.length).toEqual(1);
        expect(violations[0].message).toEqual(
          'Expected plural name for list field.',
        );
      });
    });

    describe('plural', () => {
      it('returns no violations for plural list field', async () => {
        const violations = await run(`
      model User {
        emails String[]
      }
    `);
        expect(violations.length).toEqual(0);
      });

      it('ignores non-list fields', async () => {
        const violations = await run(`
      model User {
        email String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });
  });

  describe('ifListAllow', () => {
    describe('without ifListAllow', () => {
      const run = getRunner({ ifList: 'singular' });

      it('returns violation for plural list field', async () => {
        const violations = await run(`
      model User {
        data String[]
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with string ifListAllow', () => {
      const run = getRunner({ ifList: 'singular', ifListAllow: ['data'] });

      it('returns no violations for allowlisted field', async () => {
        const violations = await run(`
      model User {
        data String[]
      }
    `);
        expect(violations.length).toEqual(0);
      });

      it('still checks non-allowlisted fields', async () => {
        const violations = await run(`
      model User {
        data String[]
        emails String[]
      }
    `);
        expect(violations.length).toEqual(1);
        expect(violations[0].message).toEqual(
          'Expected singular name for list field.',
        );
      });
    });

    describe('with regex ifListAllow', () => {
      const run = getRunner({ ifList: 'singular', ifListAllow: [/data/] });

      it('returns no violations for allowlisted field', async () => {
        const violations = await run(`
      model User {
        data String[]
      }
    `);
        expect(violations.length).toEqual(0);
      });

      it('returns violation for non-allowlisted field', async () => {
        const violations = await run(`
      model User {
        emails String[]
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
