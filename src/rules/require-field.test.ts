import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import requireField from '#src/rules/require-field.js';

describe('require-field', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      config: {
        rules: {
          'require-field': ['error', config],
        },
      },
      ruleDefinitions: [requireField],
    });

  describe('ignore comments', () => {
    const run = getRunner({
      require: ['tenantId', 'createdAt', 'revisionCreatedAt'],
    });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model require-field
          id String @id
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('respects field-specific ignore comments with comma', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model require-field tenantId,createdAt
          id String @id
        }
        `);
      expect(violations.length).toEqual(1);
      expect(violations[0].message).toContain('revisionCreatedAt');
      expect(violations[0].message).not.toContain('tenantId');
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

  describe('simple field name', () => {
    const run = getRunner({ require: ['tenantId'] });

    describe('with field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          model Product {
            id String
            tenantId String
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without field', () => {
      it('returns violation', async () => {
        const violations = await run(`
          model Product {
            id String @id
          }
        `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('conditional ifSibling regex string', () => {
    const run = getRunner({
      require: [
        {
          ifSibling: '/amountD\\d$/',
          name: 'currencyCode',
        },
      ],
    });

    describe('with field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          model Product {
            id String
            amountD6 Int
            currencyCode String
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without field', () => {
      describe('with ifSibling', () => {
        it('returns violation', async () => {
          const violations = await run(`
            model Product {
              id String
              amountD6 Int
            }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('without ifSibling', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            model Product {
              id String
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });
  });

  describe('conditional ifSibling regex', () => {
    const run = getRunner({
      require: [
        {
          ifSibling: /amountD\d$/,
          name: 'currencyCode',
        },
      ],
    });

    describe('with field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          model Product {
            id String
            amountD6 Int
            currencyCode String
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without field', () => {
      describe('with ifSibling', () => {
        it('returns violation', async () => {
          const violations = await run(`
            model Product {
              id String
              amountD6 Int
            }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('without ifSibling', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            model Product {
             id String
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });
  });

  describe('conditional ifSibling string', () => {
    const run = getRunner({
      require: [
        {
          ifSibling: 'amountD6',
          name: 'currencyCode',
        },
      ],
    });

    describe('with field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          model Product {
            id String
            amountD6 Int
            currencyCode String
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without field', () => {
      describe('with ifSibling', () => {
        it('returns violation', async () => {
          const violations = await run(`
            model Product {
              id String
              amountD6 Int
            }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('without ifSibling', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            model Product {
             id String
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });
  });
});
