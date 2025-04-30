import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import modelNameMappingSnakeCase from '#src/rules/model-name-mapping-snake-case.js';

describe('model-name-mapping-snake-case', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'model-name-mapping-snake-case': ['error', config],
        },
      },
      ruleDefinitions: [modelNameMappingSnakeCase],
    });

  describe('without config', () => {
    const run = getRunner();

    describe('valid with key', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model UserRole {
        id String @id
        @@map(name: "user_role")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('single word name with mapping', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @id
        @@map(name: "user")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('single word name without mapping', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('valid with no key', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model UserRole {
        id String @id
        @@map("user_role")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('missing @@map', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model UserRole {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('@@map has no name', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model UserRole {
        id String @id
        @@map(other: "user_role")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('with compound words', () => {
    const run = getRunner({
      compoundWords: ['Q6', 'QU', 'QX', 'BR', 'LT', 'QP', 'L5', 'TK', 'QT'],
    });

    it('returns violation', async () => {
      const violations = await run(`
      model GameBRTicketLostSequence {
        id String @id
        @@map(name: "game_br_ticket_lost_sequence")
      }
    `);
      expect(violations).toMatchObject([]);
    });
  });

  describe('expecting plural names', () => {
    const run = getRunner({ pluralize: true });

    describe('with a plural name', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model UserRole {
        id String @id
        @@map(name: "user_roles")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with a singular name', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model UserRole {
        id String @id
        @@map(name: "user_role")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('expecting irregular plural names', () => {
    const run = getRunner({
      pluralize: true,
      irregularPlurals: { bill_of_lading: 'bills_of_lading' },
    });

    describe('with a plural name', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model BillOfLading {
        id String @id
        @@map(name: "bills_of_lading")
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with a singular name', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model BillOfLading {
        id String @id
        @@map(name: "bill_of_lading")
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
