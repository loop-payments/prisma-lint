import { lintSchemaSource } from "#src/lint.js";
import tenantQid from "#src/rules/tenant-qid.js";

describe("singular-model-name", () => {
  const run = async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: "fake.ts",
      schemaSource,
      ruleRegistry: { "tenant-qid": tenantQid },
    });

  describe("with tenant qid", () => {
    it("returns no violations", async () => {
      const violations = await run(`
        model TestTable {
          tenantQid String
          createdAt DateTime
          value Json
        }`);
      expect(violations.length).toEqual(0);
    });
  });

  describe("with tenant qid comment", () => {
    it("returns no violations", async () => {
      const violations = await run(`
        model TestTable {
          ///no-tenant-field
          createdAt DateTime
          value Json
        }`);
      expect(violations.length).toEqual(0);
    });
  });

  describe("without tenant qid", () => {
    it("returns violation", async () => {
      const violations = await run(`
        model TestTable {
          createdAt DateTime
          value Json
        }`);
      expect(violations.length).toEqual(1);
    });
  });

  describe("with tenant qid not as first field", () => {
    it("returns violation", async () => {
      const violations = await run(`
        model TestTable {
          createdAt DateTime
          tenantQid String
          value Json
        }`);
      expect(violations.length).toEqual(1);
    });
  });
});
