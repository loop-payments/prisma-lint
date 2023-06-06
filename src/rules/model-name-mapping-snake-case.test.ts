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
});
