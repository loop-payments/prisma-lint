import type { RuleConfig } from '#src/common/config.js';
import { getExpectSchemaFix, testLintPrismaSource } from '#src/common/test.js';
import requireDefaultEmptyArrays from '#src/rules/require-default-empty-arrays.js';

describe('require-default-empty-arrays', () => {
  const getRunner = (config?: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'require-default-empty-arrays': ['error', config],
        },
      },
      ruleDefinitions: [requireDefaultEmptyArrays],
    });

  describe('without config', () => {
    const run = getRunner();
    const expectSchemaFix = getExpectSchemaFix(run);

    describe('valid default empty array', () => {
      it('returns no violations', async () => {
        const { violations } = await run(`
    model Post {
      tags String[] @default([])
    }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('no default', () => {
      it('returns violations', async () => {
        const { violations } = await run(`
      model Post {
        tags String[]
      }
    `);
        expect(violations.length).toEqual(1);
      });

      describe('auto-fixing', () => {
        it('fixes missing attribute by adding new one', async () => {
          await expectSchemaFix(
            `
model Post {
  tags String[]
}
---
model Post {
  tags String[] @default([])
}
`,
          );
        });

        it('preserves existing attributes', async () => {
          await expectSchemaFix(
            `
model Post {
  tags String[] @map(name: "tag_mapped")
}
---
model Post {
  tags String[] @map(name: "tag_mapped") @default([])
}
`,
          );
        });
      });
    });

    describe('non-array default', () => {
      it('returns violations', async () => {
        const { violations } = await run(`
      model Post {
        tags String[] @default("foo")
      }
    `);
        expect(violations.length).toEqual(1);
      });

      describe('auto-fixing', () => {
        it('replaces bad attribute', async () => {
          await expectSchemaFix(
            `
model Post {
  tags String[] @default("foo")
}
---
model Post {
  tags String[] @default([])
}
`,
          );
        });

        it('preserves order', async () => {
          await expectSchemaFix(
            `
model Post {
  tags String[] @default("foo") @map(name: "tags_mapped")
}
---
model Post {
  tags String[] @default([]) @map(name: "tags_mapped")
}
`,
          );
        });
      });
    });

    describe('not empty array default', () => {
      it('returns violations', async () => {
        const { violations } = await run(`
      model Post {
        tags String[] @default(["foo"])
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
