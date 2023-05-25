import modelNameGrammaticalNumber from "#src/rules/model-name-grammatical-number.js";
import { lintSchemaSource } from "#src/lint.js";
import type { RuleConfigValue } from "../util.js";

describe("model-name-grammatical-number", () => {
  const getRunner = (config: RuleConfigValue) => async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: "fake.ts",
      schemaSource,
      config: {
        rules: {
          "model-name-grammatical-number": ["error", config],
        },
      },
      ruleRegistry: {
        "model-name-grammatical-number": modelNameGrammaticalNumber,
      },
    });

  describe("ignore comments", () => {
    const run = getRunner({ grammaticalNumber: "singular" });

    it("respects rule-specific ignore comments", async () => {
      const violations = await run(`
    model Users {
      /// prisma-lint-ignore-model model-name-grammatical-number
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });

    it("respects model-wide ignore comments", async () => {
      const violations = await run(`
    model Users {
      /// prisma-lint-ignore-model
      id String @id
    }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe("expecting singular", () => {
    const run = getRunner({ grammaticalNumber: "singular" });

    describe("singular", () => {
      it("returns no violations", async () => {
        const violations = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });

    describe("plural", () => {
      it("returns violation", async () => {
        const violations = await run(`
      model Users {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe("expecting plural", () => {
    const run = getRunner({ grammaticalNumber: "plural" });
    describe("singular", () => {
      it("returns violation", async () => {
        const violations = await run(`
      model User {
        id String @id
      }
    `);
        expect(violations.length).toEqual(1);
      });
    });

    describe("plural", () => {
      it("returns no violations", async () => {
        const violations = await run(`
      model Users {
        id String @id
      }
    `);
        expect(violations.length).toEqual(0);
      });
    });
  });
});
