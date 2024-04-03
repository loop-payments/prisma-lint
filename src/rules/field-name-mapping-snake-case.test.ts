import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';

describe('field-name-mapping-snake-case', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'field-name-mapping-snake-case': ['error', config],
        },
      },
      ruleDefinitions: [fieldNameMappingSnakeCase],
    });

  describe('with requireUnderscorePrefixForIds', () => {
    const run = getRunner({ requireUnderscorePrefixForIds: true });

    describe('valid with mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @id @map(name: "_id")
        otherField String @map(name: "other_field")
      }
    `);
        expect(violations.map((v) => v.message)).toEqual([]);
      });
    });

    describe('missing @map', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        idFoo String @id
      }
    `);
        expect(violations).toHaveLength(1);
      });
    });

    describe('without prefix', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model user {
        id String @id @map(name: "id")
      }
    `);
        expect(violations.map((v) => v.message)).toEqual([
          'Field name must be mapped to "_id".',
        ]);
      });
    });

    describe('with wrong mapping', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model user {
        idTwo String @id @map(name: "_id_one")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('with compoundWords', () => {
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

    describe('valid with mapping with no key', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        graphQLId String @map("graphql_id")
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

    describe('single word with incorrect mapping', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        email String @map(name: "email_address")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('association without mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        associatedModel AssociatedModel?
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
