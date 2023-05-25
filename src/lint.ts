import path from "path";
import fs from "fs";
import { getSchema } from "@mrleebo/prisma-ast";
import {
  isModelEntirelyIgnored,
  isRuleIgnored,
  listIgnoreModelComments,
  listModelBlocks,
  type PrismaLintConfig,
  type ReportedViolation,
  type RuleConfig,
  type RuleInstance,
  type RuleRegistry,
  type Violation,
} from "#src/util.js";
import { promisify } from "util";

function getRuleLevel(ruleConfig: RuleConfig) {
  if (Array.isArray(ruleConfig)) {
    return ruleConfig[0];
  }
  return ruleConfig;
}

function getRuleConfigValue(ruleConfig: RuleConfig) {
  if (Array.isArray(ruleConfig)) {
    return ruleConfig[1] ?? {};
  }
  return {};
}

function isRuleEnabled([_, ruleConfig]: [string, RuleConfig]) {
  return getRuleLevel(ruleConfig) !== "off";
}

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
  const rules: [string, RuleInstance][] = Object.entries(config.rules)
    .filter(isRuleEnabled)
    .map(([ruleName, ruleConfig]) => {
      const ruleDefinition = ruleRegistry[ruleName];
      if (ruleDefinition == null) {
        throw new Error("Unable to find rule for " + ruleName);
      }
      const config = getRuleConfigValue(ruleConfig);
      const context = {
        fileName,
        report: ({ node, message }: ReportedViolation) => {
          message = message ?? ruleDefinition.meta.defaultMessage;
          if (message == null) {
            throw new Error(`Expected message for rule ${ruleName}`);
          }
          violations.push({
            ruleName,
            node,
            message,
          });
        },
      };
      const ruleInstance = ruleDefinition.create(config, context);
      return [ruleName, ruleInstance];
    });
  const modelNodes = listModelBlocks(schema);
  modelNodes.forEach((modelNode) => {
    const comments = listIgnoreModelComments(modelNode);
    if (isModelEntirelyIgnored(comments)) {
      return;
    }
    rules
      .filter(([ruleName]) => !isRuleIgnored(ruleName, comments))
      .forEach(([_, ruleInstance]) => {
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
