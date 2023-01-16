import { lintSchemaSource } from "src/lint";
import dbPrefixedModelName from "src/rules/db-prefixed-model-name";

describe("singular-model-name", () => {
  const run = async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: "fake.ts",
      schemaSource,
      ruleRegistry: { "db-prefixed-model-name": dbPrefixedModelName },
    });

  describe("db-prefixed model name", () => {
    it("returns no violations", async () => {
      const violations = await run(`
      model DbUser {
        id String @id
      }
    `);
      expect(violations.length).toEqual(0);
    });
  });

  describe("unprefixed model name", () => {
    it("returns violation", async () => {
      const violations = await run(`
      model User {
        id String @id
      }
    `);
      expect(violations.length).toEqual(1);
    });
  });
});
