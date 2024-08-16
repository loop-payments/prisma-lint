import { getPrismaSchema } from '#src/common/get-prisma-schema.js';
import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
  listIgnoreEnumComments,
  isEnumEntirelyIgnored,
} from '#src/common/ignore.js';
import {
  listModelBlocks,
  listFields,
  listEnumBlocks,
  listCustomTypeBlocks,
} from '#src/common/prisma.js';
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
  // Parse source code into AST.
  const prismaSchema = getPrismaSchema(sourceCode);

  // Mutable list of violations added to by rule instances.
  const violations: Violation[] = [];

  const enums = listEnumBlocks(prismaSchema);
  const enumNames = new Set(enums.map((e) => e.name));
  const customTypes = listCustomTypeBlocks(prismaSchema);
  const customTypeNames = new Set(customTypes.map((e) => e.name));

  // Create rule instances.
  const namedRuleInstances: NamedRuleInstance[] = rules.map(
    ({ ruleDefinition, ruleConfig }) => {
      const { ruleName } = ruleDefinition;
      const report = (nodeViolation: NodeViolation) =>
        violations.push({ ruleName, fileName, ...nodeViolation });
      const context = {
        customTypeNames,
        enumNames,
        fileName,
        report,
        sourceCode,
      };
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

  enums.forEach((enumObj) => {
    const comments = listIgnoreEnumComments(enumObj);
    if (isEnumEntirelyIgnored(comments)) {
      return;
    }
    namedRuleInstances
      .filter(({ ruleName }) => !isRuleEntirelyIgnored(ruleName, comments))
      .forEach(({ ruleInstance }) => {
        if ('Enum' in ruleInstance) {
          ruleInstance.Enum(enumObj);
        }
      });
  });

  return violations;
}
