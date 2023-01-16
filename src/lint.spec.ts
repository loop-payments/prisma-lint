import { lintSchemaFile, lintSchemaSource } from "src/lint";
import ruleRegistry from "src/rule-registry";

describe("lint", () => {
  describe("lintSchemaFile", () => {
    describe("valid schema", () => {
      it("returns no violations", async () => {
        const violations = await lintSchemaFile({
          schemaFile: "fixture/valid.prisma",
          ruleRegistry,
        });
        expect(violations.length).toEqual(0);
      });
    });

    describe("invalid schema", () => {
      it("returns violations", async () => {
        const violations = await lintSchemaFile({
          schemaFile: "fixture/invalid.prisma",
          ruleRegistry,
        });
        expect(violations.length).toEqual(1);
        expect(violations[0].description).toEqual(
          "Expected singular model name."
        );
        expect(violations[0].ruleName).toEqual("singular-model-name");
      });
    });
  });

  describe("lintSchemaSource", () => {
    describe("valid schema", () => {
      it("returns no violations", async () => {
        const violations = await lintSchemaSource({
          schemaSource: `
model User {
  id         String @id
}        
        `,
          ruleRegistry,
          fileName: "fake.ts",
        });
        expect(violations.length).toEqual(0);
      });
    });

    describe("invalid schema", () => {
      it("returns violations", async () => {
        const violations = await lintSchemaSource({
          schemaSource: `
model Users {
  id         String @id
}        
        `,
          ruleRegistry,
          fileName: "fake.ts",
        });
        expect(violations.length).toEqual(1);
        expect(violations[0].description).toEqual(
          "Expected singular model name."
        );
        expect(violations[0].ruleName).toEqual("singular-model-name");
      });
    });
  });
});
