import { testLintPrismaSource } from '#src/common/test.js';
import forbidRequiredIgnoredField from '#src/rules/forbid-required-ignored-field.js';

describe('forbid-required-ignored-field', () => {
  const getRunner = () => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'forbid-required-ignored-field': ['error'],
        },
      },
      ruleDefinitions: [forbidRequiredIgnoredField],
    });

  describe('forbidding', () => {
    const run = getRunner();

    describe('with ignored relation-only field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id    Int    @id @default(autoincrement())
        posts Post[] @ignore
      }
      
      model Post {
        id       Int  @id @default(autoincrement())
        author   User @relation(fields: [authorId], references: [id])
        authorId Int 
        title String
        @@ignore 
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with optional ignored field', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String
        toBeRemoved String? @ignore
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with required ignored field with default', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model Users {
        id String
        deleted String @ignore @default(false)
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with required ignored field', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String
        toBeRemoved String @ignore
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
