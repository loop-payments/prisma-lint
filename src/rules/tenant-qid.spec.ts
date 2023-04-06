import { lintSchemaSource } from "../lint.js";
import tenantQid from "./tenant-qid.js";

describe("singular-model-name", () => {
  const run = async (schemaSource: string) =>
    await lintSchemaSource({
      fileName: "fake.ts",
      schemaSource,
      ruleRegistry: { "tenant-qid": tenantQid },
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
/*
describe("tenant qid", () => {
  it("approves proper models", () => {
    const schema = `
model TestTable {
  tenantQid String
  createdAt DateTime
  value Json
  
  @@map(name: "test_table")
}`;
    const loadedSchema = getModels(schema);
    const out = ensureTenantField(loadedSchema);
    expect(out).toEqual([]);
  });

  it("warns for models with tenantQid as second field", () => {
    const schema = `
model TestTable {
  createdAt DateTime
  tenantQid String
  value Json
}`;
    const loadedSchema = getModels(schema);
    const out = ensureTenantField(loadedSchema);
    expect(out).toEqual([
      {
        modelName: "TestTable",
        error: "Expected tenantQid field to be the first field in the model",
      },
    ]);
  });

  it("warns for models with no tenantQid field", () => {
    const schema = `
model TestTable {
  createdAt DateTime
  value Json
}`;
    const loadedSchema = getModels(schema);
    const out = ensureTenantField(loadedSchema);
    expect(out).toEqual([
      {
        modelName: "TestTable",
        error:
          "Expected tenantQid field to be the first field or have the ///no-tenant-field comment in the model",
      },
    ]);
  });

  it("approves of no tenant field with comment", () => {
    const schema = `
model ideas {
  ///no-tenant-field
  id String
  createdAt DateTime
  value Json
}`;
    const loadedSchema = getModels(schema);
    const out = ensureTenantField(loadedSchema);
    expect(out).toEqual([]);
  });
});*/
