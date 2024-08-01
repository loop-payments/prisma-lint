import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import banUnboundedStringType from '#src/rules/ban-unbounded-string-type.js';

describe('ban-unbounded-string-type', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'ban-unbounded-string-type': ['error', config],
        },
      },
      ruleDefinitions: [banUnboundedStringType],
    });

  describe('empty config', () => {
    const run = getRunner();

    describe('bounded string type', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @db.VarChar(36)
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('unbounded string type', () => {
      it('returns violation', async () => {
        const violations = await run(`
      model Users {
        id String 
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('native @db.Text type without override', () => {
      it('returns violation', async () => {
        const violations = await run(`
        model Users {
          id String @db.Text
        }
      `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('allow native @db.Text type', () => {
    const run = getRunner({
      allowNativeTextType: true,
    });

    describe('@db.Text type permitted', () => {
      it('returns no violations', async () => {
        const violations = await run(`
      model User {
        id String @db.Text
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });
  });
});
