import type { RuleConfig } from '#src/common/config.js';
import { lintSchemaSource } from '#src/lint.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';

describe('field-name-mapping-snake-case', () => {
  const getRunner = (config?: RuleConfig) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: 'fake.ts',
      schemaSource,
      config: {
        rules: {
          'field-name-mapping-snake-case': ['error', config],
        },
      },
      ruleRegistry: {
        'field-name-mapping-snake-case': fieldNameMappingSnakeCase,
      },
    });

  describe('with config', () => {
    const run = getRunner({ compoundWords: ['graphQL'] });

    describe('valid with mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        graphQLId String @map(name: "graphql_id")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('valid without mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('missing @map', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        graphQLId String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('@@map with wrong name', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        graphQLId String @map(name: "graph_q_l_id")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('with invalid config', () => {
    it('throws error', async () => {
      expect(() => {
        fieldNameMappingSnakeCase.create({ compoundWords: 1 }, {} as any);
      }).toThrowErrorMatchingInlineSnapshot(`
        "Failed to parse config for rule 'field-name-mapping-snake-case'
          Value: '{"compoundWords":1}'
          Expected array, received number"
      `);
    });
  });

  describe('without config', () => {
    const run = getRunner();

    describe('valid with mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        emailAddress String @map(name: "email_address")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('valid without mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        email String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('missing @map', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        emailAddress String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('@@map with wrong name', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        emailAddress String @map(name: "emailaddress")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
