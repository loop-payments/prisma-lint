import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import requiredFields from '#src/rules/required-fields.js';

describe('required-fields', () => {
  const getRunner = (config: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'required-fields': ['error', config],
        },
      },
      ruleRegistry: {
        'required-fields': requiredFields,
      },
    });

  describe('ignore comments', () => {
    const run = getRunner({
      requiredFields: ['tenantId', 'createdAt', 'revisionCreatedAt'],
    });

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model required-fields
          id String @id
        }
        `);
      expect(violations.length).toEqual(0);
    });

    it('respects field-specific ignore comments', async () => {
      const violations = await run(`
        model Products {
          /// prisma-lint-ignore-model required-fields tenantId,createdAt
          id String @id
        }
        `);
      expect(violations.length).toEqual(1);
      expect(violations[0].message).toContain('revisionCreatedAt');
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
    const run = getRunner({ requiredFields: ['tenantId'] });

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

  describe('conditional ifField regex string', () => {
    const run = getRunner({
      requiredFields: [
        {
          ifField: '/amountD\\d$/',
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
            currencyCode string
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without field', () => {
      describe('with ifField', () => {
        it('returns violation', async () => {
          const violations = await run(`
            model Product {
              id string
              amountD6 Int
            }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('without ifField', () => {
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

  describe('conditional ifField regex', () => {
    const run = getRunner({
      requiredFields: [
        {
          ifField: /amountD\d$/,
          name: 'currencyCode',
        },
      ],
    });

    describe('with field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
          model Product {
            id string
            amountD6 Int
            currencyCode string
          }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('without field', () => {
      describe('with ifField', () => {
        it('returns violation', async () => {
          const violations = await run(`
            model Product {
              id string
              amountD6 Int
            }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('without ifField', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            model Product {
             id string
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });
  });

  describe('conditional ifField string', () => {
    const run = getRunner({
      requiredFields: [
        {
          ifField: 'amountD6',
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
      describe('with ifField', () => {
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

      describe('without ifField', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            model Product {
             id string
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });
  });
});
