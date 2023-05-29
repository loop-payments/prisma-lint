import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import { getSchema } from '@mrleebo/prisma-ast';

import { type RuleName, type RuleConfigList } from '#src/common/config.js';
import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
} from '#src/common/ignore.js';
import { listModelBlocks, listFields } from '#src/common/prisma.js';
import type { RuleInstance, RuleRegistry } from '#src/common/rule.js';

import type { Violation, NodeViolation } from '#src/common/violation.js';

export type FileName = string;
export type FileViolationList = [FileName, Violation[]][];
export type RuleInstanceList = [RuleName, RuleInstance][];

export async function lintPrismaSource({
  fileName,
  schemaSource,
  ruleConfigList,
  ruleRegistry,
}: {
  fileName: string;
  schemaSource: string;
  ruleConfigList: RuleConfigList;
  ruleRegistry: RuleRegistry;
}) {
  const schema = getSchema(schemaSource);

  // Mutatable list of violations added to by rule instances.
  const violations: Violation[] = [];

  // Create rule instances.
  const ruleInstanceList: RuleInstanceList = ruleConfigList.map(
    ([ruleName, ruleConfig]) => {
      const ruleDefinition = ruleRegistry[ruleName];
      if (ruleDefinition == null) {
        throw new Error(`Unable to find rule for ${ruleName}`);
      }
      const report = (nodeViolation: NodeViolation) =>
        violations.push({ ruleName, fileName, ...nodeViolation });
      const context = { fileName, report };
      const ruleInstance = ruleDefinition.create(ruleConfig, context);
      return [ruleName, ruleInstance];
    },
  );

  // Run each rule instance for each AST node.
  const models = listModelBlocks(schema);
  models.forEach((model) => {
    const comments = listIgnoreModelComments(model);
    if (isModelEntirelyIgnored(comments)) {
      return;
    }
    const fields = listFields(model);
    ruleInstanceList
      .filter(([ruleName]) => !isRuleEntirelyIgnored(ruleName, comments))
      .forEach(([_, ruleInstance]) => {
        if ('Model' in ruleInstance) {
          ruleInstance.Model(model);
        }
        if ('Field' in ruleInstance) {
          fields.forEach((field) => {
            ruleInstance.Field(model, field);
          });
        }
      });
  });
  return violations;
}

export const lintPrismaFiles = async ({
  ruleConfigList,
  fileNames,
  ruleRegistry,
}: {
  ruleConfigList: RuleConfigList;
  fileNames: string[];
  ruleRegistry: RuleRegistry;
}): Promise<FileViolationList> => {
  const fileViolationList: FileViolationList = [];
  for (const fileName of fileNames) {
    const fileViolations = await lintPrismaFile({
      ruleConfigList,
      fileName,
      ruleRegistry,
    });
    fileViolationList.push([fileName, fileViolations]);
  }
  return fileViolationList;
};

export const lintPrismaFile = async ({
  ruleConfigList,
  fileName,
  ruleRegistry,
}: {
  fileName: string;
  ruleConfigList: RuleConfigList;
  ruleRegistry: RuleRegistry;
}): Promise<Violation[]> => {
  const filePath = path.resolve(fileName);
  const schemaSource = await promisify(fs.readFile)(filePath, {
    encoding: 'utf8',
  });
  return await lintPrismaSource({
    schemaSource,
    fileName,
    ruleConfigList,
    ruleRegistry,
  });
};
