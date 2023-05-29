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

  describe('ignore comments', () => {
    const run = getRunner({
      forNames: ['qid', 'tenantQid', 'createdAt'],
    });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model required-field-index
          tenantQid String
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('respects field-specific ignore comments with comma', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model required-field-index tenantQid,createdAt
          tenantQid String
          createdAt DateTime
          qid String
        }
        `);
      expect(violations.length).toEqual(1);
      expect(violations[0].message).toContain('qid');
      expect(violations[0].message).not.toContain('tenantQid');
      expect(violations[0].message).not.toContain('createdAt');
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model
          id String @id
        }
      `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('string literal field name', () => {
    const run = getRunner({
      forNames: ['tenantQid'],
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

  describe('regex field name', () => {
    const run = getRunner({
      forNames: ['/.*Qid$/'],
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
