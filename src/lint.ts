import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import { getSchema as getPrismaSchema } from '@mrleebo/prisma-ast';

import { type RuleName, type RuleConfigList } from '#src/common/config.js';
import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
} from '#src/common/ignore.js';
import { listModelBlocks, listFields } from '#src/common/prisma.js';
import type { RuleInstance, RuleRegistry } from '#src/common/rule.js';

import type { Violation, NodeViolation } from '#src/common/violation.js';

type FileName = string;
type FileViolationList = [FileName, Violation[]][];
type RuleInstanceList = [RuleName, RuleInstance][];

export async function lintPrismaSourceCode({
  ruleRegistry,
  ruleConfigList,
  fileName,
  sourceCode,
}: {
  ruleRegistry: RuleRegistry;
  ruleConfigList: RuleConfigList;
  fileName: string;
  sourceCode: string;
}) {
  const prismaSchema = getPrismaSchema(sourceCode);

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
  const models = listModelBlocks(prismaSchema);
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
  ruleRegistry,
  ruleConfigList,
  fileNames,
}: {
  ruleRegistry: RuleRegistry;
  ruleConfigList: RuleConfigList;
  fileNames: string[];
}): Promise<FileViolationList> => {
  const fileViolationList: FileViolationList = [];
  for (const fileName of fileNames) {
    const fileViolations = await lintPrismaFile({
      ruleRegistry,
      ruleConfigList,
      fileName,
    });
    fileViolationList.push([fileName, fileViolations]);
  }
  return fileViolationList;
};

export const lintPrismaFile = async (params: {
  ruleRegistry: RuleRegistry;
  ruleConfigList: RuleConfigList;
  fileName: string;
}): Promise<Violation[]> => {
  const filePath = path.resolve(params.fileName);
  const sourceCode = await promisify(fs.readFile)(filePath, {
    encoding: 'utf8',
  });
  return lintPrismaSourceCode({ ...params, sourceCode });
};
