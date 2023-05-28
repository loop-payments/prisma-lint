import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import requiredFieldType from '#src/rules/required-field-index.js';

describe('required-field-index', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'required-field-index': ['error', config],
        },
      },
      ruleRegistry: {
        'required-field-index': requiredFieldType,
      },
    });

  describe('string literal field name', () => {
    const run = getRunner({
      required: [{ ifName: 'tenantQid' }],
    });

    describe('with @unique tag', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        tenantQid String @unique
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with @@index', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        tenantQid String
        @@index(tenantQid)
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with first in compound @@index', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        tenantQid String
        createdAt DateTime
        @@index([tenantQid, createdAt])
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with second in compound @@index', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        tenantQid String
        createdAt DateTime
        @@index([createdAt, tenantQid])
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with no index', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        tenantQid String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
