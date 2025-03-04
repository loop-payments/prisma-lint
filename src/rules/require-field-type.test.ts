import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import requireFieldType from '#src/rules/require-field-type.js';

describe('require-field-type', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'require-field-type': ['error', config],
        },
      },
      ruleDefinitions: [requireFieldType],
    });

  describe('string literal field name', () => {
    const run = getRunner({
      require: [{ ifName: 'id', type: 'String' }],
    });

    describe('correct type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('string literal field name with native type', () => {
    const run = getRunner({
      require: [{ ifName: 'id', type: 'String', nativeType: 'Uuid' }],
    });

    describe('correct type and native type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @db.Uuid
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('missing native type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('incorrect native type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String @db.Oid
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex field name', () => {
    const run = getRunner({
      require: [{ ifName: /At$/, type: 'DateTime' }],
    });

    describe('correct type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        createdAt DateTime
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        createdAt Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex field name with native type', () => {
    const run = getRunner({
      require: [{ ifName: /Id$/, type: 'String', nativeType: 'Uuid' }],
    });

    describe('correct type and native type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        userId String @db.Uuid
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        userId Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('missing native type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        userId String 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('incorrect native type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        userId String @db.Oid
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex string field name', () => {
    const run = getRunner({
      require: [{ ifName: '/At$/', type: 'DateTime' }],
    });

    describe('correct type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        createdAt DateTime
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        createdAt Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('regex string field name with native type', () => {
    const run = getRunner({
      require: [{ ifName: '/Id$/', type: 'String', nativeType: 'Uuid' }],
    });

    describe('correct type and native type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        userId String @db.Uuid
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('incorrect type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        userId Int 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('missing native type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        userId String 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('incorrect native type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        userId String @db.Oid
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
