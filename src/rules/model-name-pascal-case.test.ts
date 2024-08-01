import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import modelNamePascalCase from '#src/rules/model-name-pascal-case.js';

describe('model-name-pascal-case', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'model-name-pascal-case': ['error', config],
        },
      },
      ruleDefinitions: [modelNamePascalCase],
    });

  describe('ignore comments', () => {
    const run = getRunner();

    it('respects rule-specific ignore comments', async () => {
      const violations = await run(`
    model users {
      /// prisma-lint-ignore-model model-name-pascal-case
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('respects model-wide ignore comments', async () => {
      const violations = await run(`
    model users {
      /// prisma-lint-ignore-model
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('without config', () => {
    const run = getRunner();

    describe('single word', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('compound word in PascalCase', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model DbUsers {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('first character is not uppercase', () => {
      it('returns violation', async () => {
        const violations = await run(`
        model dbUsers {
          id String @id
        }
      `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('contains underscore', () => {
      it('returns violation', async () => {
        const violations = await run(`
        model DB_Users {
          id String @id
        }
      `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('permits digits anywhere', () => {
      it('returns no violations', async () => {
        const violations = await run(`
        model Db2Us3rs {
          id String @id
        }
      `);
        expect(violations.length).toEqual(0);
      });
    });
  });

  describe('with allowlist string', () => {
    const run = getRunner({ allowList: ['dbUser'] });

    it('returns no violations', async () => {
      const violations = await run(`
    model dbUser {
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('allowList string requires full match', async () => {
      const violations = await run(`
    model dbUsersWithSuffix {
      id String @id
    }
    `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with allowlist regexp', () => {
    const run = getRunner({ allowList: [/^db.*/] });

    it('returns no violations', async () => {
      const violations = await run(`
    model db_user {
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe('with trimPrefix single string', () => {
    const run = getRunner({ trimPrefix: 'db' });

    it('returns no violations', async () => {
      const violations = await run(`
    model dbUser {
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix must be PascalCase', async () => {
      const violations = await run(`
    model dbcamelCase {
      id String @id
    }
    `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with trimPrefix single regexp', () => {
    const run = getRunner({ trimPrefix: /^db/ });

    it('returns no violations', async () => {
      const violations = await run(`
    model dbUser {
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix must be PascalCase', async () => {
      const violations = await run(`
    model dbcamelCase {
      id String @id
    }
    `);
      expect(violations.length).toEqual(1);
    });
  });

  describe('with trimPrefix array', () => {
    const run = getRunner({ trimPrefix: ['db', /^eg/] });

    it('returns no violations for first prefix', async () => {
      const violations = await run(`
    model dbUser {
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it('returns no violations for second prefix', async () => {
      const violations = await run(`
      model egUser {
        id String @id
      }
      `);
      expect(violations.length).toEqual(0);
    });

    it('remaining suffix after string must be PascalCase', async () => {
      const violations = await run(`
    model dbcamelCase {
      id String @id
    }
    `);
      expect(violations.length).toEqual(1);
    });

    it('remaining suffix after regexp must be PascalCase', async () => {
      const violations = await run(`
      model egcamelCase {
        id String @id
      }
      `);
      expect(violations.length).toEqual(1);
    });
  });
});
