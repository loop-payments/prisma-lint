import path from "path";
import fs from "fs";
import { getSchema } from "@mrleebo/prisma-ast";
import { listModelBlocks, RuleRegistry, Violation } from "./util.js";
import { promisify } from "util";

export async function lintSchemaSource({
  fileName,
  schemaSource,
  ruleRegistry,
}: {
  fileName: string;
  schemaSource: string;
  ruleRegistry: RuleRegistry;
}) {
  const schema = await getSchema(schemaSource);
  const violations: Violation[] = [];
  const ruleInstances = Object.entries(ruleRegistry).map(
    ([ruleName, ruleDefinition]) =>
      ruleDefinition.create({
        fileName,
        report: ({ node, description }) => {
          violations.push({
            ruleName,
            node,
            description: description ?? ruleDefinition.meta.description,
          });
        },
      })
  );
  const modelNodes = listModelBlocks(schema);
  modelNodes.forEach((modelNode) => {
    ruleInstances.forEach((ruleInstance) => {
      ruleInstance.Model(modelNode);
    });
  });
  return violations;
}

export const lintSchemaFile = async ({
  schemaFile,
  ruleRegistry,
}: {
  schemaFile: string;
  ruleRegistry: RuleRegistry;
}): Promise<Violation[]> => {
  const fileName = schemaFile.includes(process.cwd())
    ? schemaFile
    : path.join(process.cwd(), schemaFile);
  const schemaSource = await promisify(fs.readFile)(fileName, {
    encoding: "utf8",
  });
  return await lintSchemaSource({ schemaSource, fileName, ruleRegistry });
};
