import { getSchema as getPrismaSchema } from '@mrleebo/prisma-ast';

import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
} from '#src/common/ignore.js';
import { listModelBlocks, listFields } from '#src/common/prisma.js';
import type { Rule, RuleInstance } from '#src/common/rule.js';

import type { Violation, NodeViolation } from '#src/common/violation.js';

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

  // Mutable list of violations added to by rule instances.
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
