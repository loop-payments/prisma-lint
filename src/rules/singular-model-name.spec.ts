import singularModelName from "src/rules/singular-model-name";
import { lintSchemaSource } from "src/lint";

describe("singular-model-name", () => {
  const run = async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: "fake.ts",
      schemaSource,
      ruleRegistry: { "singular-model-name": singularModelName },
    });

  describe("singular model name", () => {
    it("returns no violations", async () => {
      const violations = await run(`
      model User {
        id String @id
      }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe("plural model name", () => {
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
