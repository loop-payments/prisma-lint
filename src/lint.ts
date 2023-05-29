import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import { getSchema as getPrismaSchema } from '@mrleebo/prisma-ast';

import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
} from '#src/common/ignore.js';
import { listModelBlocks, listFields } from '#src/common/prisma.js';
import type { Rule, RuleInstance } from '#src/common/rule.js';

import type { Violation, NodeViolation } from '#src/common/violation.js';

type FileViolations = { fileName: string; violations: Violation[] }[];
type RuleInstances = { ruleName: string; ruleInstance: RuleInstance }[];

export async function lintPrismaSourceCode({
  rules,
  fileName,
  sourceCode,
}: {
  rules: Rule[];
  fileName: string;
  sourceCode: string;
}) {
  const prismaSchema = getPrismaSchema(sourceCode);

  // Mutatable list of violations added to by rule instances.
  const violations: Violation[] = [];

  // Create rule instances.
  const ruleInstanceList: RuleInstances = rules.map(
    ({ ruleDefinition, ruleConfig }) => {
      const { ruleName } = ruleDefinition;
      const report = (nodeViolation: NodeViolation) =>
        violations.push({ ruleName, fileName, ...nodeViolation });
      const context = { fileName, report };
      const ruleInstance = ruleDefinition.create(ruleConfig, context);
      return { ruleName, ruleInstance };
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
      .filter(({ ruleName }) => !isRuleEntirelyIgnored(ruleName, comments))
      .forEach(({ ruleInstance }) => {
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
  rules,
  fileNames,
}: {
  rules: Rule[];
  fileNames: string[];
}): Promise<FileViolations> => {
  const fileViolationList: FileViolations = [];
  for (const fileName of fileNames) {
    const violations = await lintPrismaFile({
      rules,
      fileName,
    });
    fileViolationList.push({ fileName, violations });
  }
  return fileViolationList;
};

export const lintPrismaFile = async ({
  rules,
  fileName,
}: {
  rules: Rule[];
  fileName: string;
}): Promise<Violation[]> => {
  const filePath = path.resolve(fileName);
  const sourceCode = await promisify(fs.readFile)(filePath, {
    encoding: 'utf8',
  });
  return lintPrismaSourceCode({ rules, fileName, sourceCode });
};
