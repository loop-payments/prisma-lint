import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import requireFieldType from '#src/rules/require-field-index.js';

describe('require-field-index', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      config: {
        rules: {
          'require-field-index': ['error', config],
        },
      },
      ruleRegistry: {
        'require-field-index': requireFieldType,
      },
    });

  describe('ignore comments', () => {
    const run = getRunner({
      forNames: ['qid', 'tenantQid', 'createdAt'],
    });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model require-field-index
          tenantQid String
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('respects field-specific ignore comments with comma', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model require-field-index tenantQid,createdAt
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

  describe('relations', () => {
    const run = getRunner({
      forAllRelations: true,
    });

    it('returns no violations for indexed relation fields', async () => {
      const violations = await run(`
        model Foo {
          qid String @id
          barRef String
          bar Bar @relation(fields: [barRef], references: [ref])
          @@index([barRef])
        }
      `);
      expect(violations.length).toEqual(0);
    });

    it('returns violations for non-indexed relation fields', async () => {
      const violations = await run(`
        model Foo {
          qid String @id
          barRef String
          bar Bar @relation(fields: [barRef], references: [ref])
        }
      `);
      expect(violations.length).toEqual(1);
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
      forNames: ['/.*[Qq]id$/'],
    });

    describe('with @id tag', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        qid String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
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
