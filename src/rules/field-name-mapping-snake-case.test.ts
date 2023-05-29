import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';

describe('field-name-mapping-snake-case', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      config: {
        rules: {
          'field-name-mapping-snake-case': ['error', config],
        },
      },
      ruleDefinitions: [fieldNameMappingSnakeCase],
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
