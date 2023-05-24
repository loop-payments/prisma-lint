import { lintSchemaFile, lintSchemaSource } from "#src/lint.js";
import singularModelName from "#src/rules/singular-model-name.js";

describe("lint", () => {
  describe("lintSchemaFile", () => {
    describe("valid schema", () => {
      it("returns no violations", async () => {
        const violations = await lintSchemaFile({
          schemaFile: "fixture/valid.prisma",
          ruleRegistry: { "singular-model-name": singularModelName },
          config: {
            rules: {
              "singular-model-name": "error",
            },
          },
        });
        expect(violations.length).toEqual(0);
      });
    });

    describe("invalid schema", () => {
      it("returns violations", async () => {
        const violations = await lintSchemaFile({
          schemaFile: "fixture/invalid.prisma",
          ruleRegistry: { "singular-model-name": singularModelName },
          config: {
            rules: {
              "singular-model-name": "error",
            },
          },
        });
        expect(violations.length).toEqual(1);
        expect(violations[0]?.message).toEqual("Expected singular model name.");
        expect(violations[0]?.ruleName).toEqual("singular-model-name");
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
          ruleRegistry: { "singular-model-name": singularModelName },
          fileName: "fake.ts",
          config: {
            rules: {
              "singular-model-name": "error",
            },
          },
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
          ruleRegistry: { "singular-model-name": singularModelName },
          fileName: "fake.ts",
          config: {
            rules: {
              "singular-model-name": "error",
            },
          },
        });
        expect(violations.length).toEqual(1);
        expect(violations[0]?.message).toEqual("Expected singular model name.");
        expect(violations[0]?.ruleName).toEqual("singular-model-name");
      });
    });
  });
});
