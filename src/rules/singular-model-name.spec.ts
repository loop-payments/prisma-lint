import singularModelName from "#src/rules/singular-model-name.js";
import { lintSchemaSource } from "#src/lint.js";

describe("singular-model-name", () => {
  const run = async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: "fake.ts",
      schemaSource,
      ruleRegistry: { "singular-model-name": singularModelName },
    });

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
