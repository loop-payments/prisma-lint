import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import fieldOrder from '#src/rules/field-order.js';

describe('field-order', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'field-order': ['error', config],
        },
      },
      ruleRegistry: {
        'field-order': fieldOrder,
      },
    });

  describe('expecting tenant qid first', () => {
    const run = getRunner({
      order: ['tenantQid', 'randomMissingField', '...'],
    });

    describe('with tenant qid as first field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        tenantQid String
        qid String
        email String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with no tenant qid', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        qid String
        email String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with tenant qid out of order', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        qid String
        tenantQid String
        email String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
  describe('expecting tenant qid last', () => {
    const run = getRunner({
      order: ['randomMissingField', '...', 'tenantQid'],
    });

    describe('with tenant qid as last field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        qid String
        email String
        tenantQid String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with no tenant qid', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        qid String
        email String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with tenant qid out of order', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        qid String
        tenantQid String
        email String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});