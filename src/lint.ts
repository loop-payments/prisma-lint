import path from "path";
import fs from "fs";
import { getSchema } from "@mrleebo/prisma-ast";
import {
  listModelBlocks,
  type ReportedViolation,
  type RuleRegistry,
  type Violation,
} from "#src/util.js";
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
  const schema = getSchema(schemaSource);
  const violations: Violation[] = [];
  const ruleInstances = Object.entries(ruleRegistry).map(
    ([ruleName, ruleDefinition]) =>
      ruleDefinition.create({
        fileName,
        report: ({ node, message }: ReportedViolation) => {
          const finalMessage = message ?? ruleDefinition.meta.defaultMessage;
          if (finalMessage == null) {
            throw new Error(`Expected message for rule ${ruleName}`);
          }
          violations.push({
            ruleName,
            node,
            message: finalMessage,
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
  const fileName = path.resolve(schemaFile);
  const schemaSource = await promisify(fs.readFile)(fileName, {
    encoding: "utf8",
  });
  return await lintSchemaSource({ schemaSource, fileName, ruleRegistry });
};
