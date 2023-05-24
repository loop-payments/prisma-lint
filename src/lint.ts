import path from "path";
import fs from "fs";
import { getSchema } from "@mrleebo/prisma-ast";
import {
  listModelBlocks,
  type PrismaLintConfig,
  type ReportedViolation,
  type RuleRegistry,
  type Violation,
} from "#src/util.js";
import { promisify } from "util";

export async function lintSchemaSource({
  fileName,
  schemaSource,
  config,
  ruleRegistry,
}: {
  fileName: string;
  schemaSource: string;
  config: PrismaLintConfig;
  ruleRegistry: RuleRegistry;
}) {
  const schema = getSchema(schemaSource);
  const violations: Violation[] = [];
  const ruleInstances = Object.entries(config.rules)
    .filter(([_, ruleLevel]) => ruleLevel !== "off")
    .map(([ruleName]) => {
      const ruleDefinition = ruleRegistry[ruleName];
      if (ruleDefinition == null) {
        throw new Error("Unable to find rule for " + ruleName);
      }
      return ruleDefinition.create({
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
      });
    });
  const modelNodes = listModelBlocks(schema);
  modelNodes.forEach((modelNode) => {
    ruleInstances.forEach((ruleInstance) => {
      ruleInstance.Model(modelNode);
    });
  });
  return violations;
}

export const lintSchemaFile = async ({
  config,
  schemaFile,
  ruleRegistry,
}: {
  schemaFile: string;
  config: PrismaLintConfig;
  ruleRegistry: RuleRegistry;
}): Promise<Violation[]> => {
  const fileName = path.resolve(schemaFile);
  const schemaSource = await promisify(fs.readFile)(fileName, {
    encoding: "utf8",
  });
  return await lintSchemaSource({
    schemaSource,
    fileName,
    config,
    ruleRegistry,
  });
};
