import {
  PrismaParser,
  VisitorClassFactory,
  getSchema as getPrismaSchema,
} from '@mrleebo/prisma-ast';

import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
} from '#src/common/ignore.js';
import { listModelBlocks, listFields } from '#src/common/prisma.js';
import type { Rule, RuleInstance } from '#src/common/rule.js';

import type { Violation, NodeViolation } from '#src/common/violation.js';

type NamedRuleInstance = { ruleName: string; ruleInstance: RuleInstance };

export function lintPrismaSourceCode({
  rules,
  fileName,
  sourceCode,
}: {
  rules: Rule[];
  fileName: string;
  sourceCode: string;
}): Violation[] {
  const parser = new PrismaParser({ nodeLocationTracking: 'full' });
  const VisitorClass = VisitorClassFactory(parser);
  const visitor = new VisitorClass();
  const prismaSchema = getPrismaSchema(sourceCode, { parser, visitor });

  // Mutable list of violations added to by rule instances.
  const violations: Violation[] = [];

  // Create rule instances.
  const namedRuleInstances: NamedRuleInstance[] = rules.map(
    ({ ruleDefinition, ruleConfig }) => {
      const { ruleName } = ruleDefinition;
      const report = (nodeViolation: NodeViolation) =>
        violations.push({ ruleName, fileName, ...nodeViolation });
      const context = { fileName, report, sourceCode };
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
    namedRuleInstances
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
