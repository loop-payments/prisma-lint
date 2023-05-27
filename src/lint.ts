import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import { getSchema } from '@mrleebo/prisma-ast';

import {
  getRuleConfig,
  getRuleLevel,
  type PrismaLintConfig,
  type RuleConfigValue,
  type RuleName,
} from '#src/common/config.js';
import {
  isModelEntirelyIgnored,
  isRuleEntirelyIgnored,
  listIgnoreModelComments,
} from '#src/common/ignore.js';
import { listModelBlocks, listFields } from '#src/common/prisma.js';
import type { RuleInstance, RuleRegistry } from '#src/common/rule.js';

import type { Violation, NodeViolation } from '#src/common/violation.js';

function isRuleEnabled([_, value]: [RuleName, RuleConfigValue]) {
  return getRuleLevel(value) !== 'off';
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

  // Mutatable list of violations added to by rule instances.
  const violations: Violation[] = [];

  // Create rule instances.
  const rules: [RuleName, RuleInstance][] = Object.entries(config.rules)
    .filter(isRuleEnabled)
    .map(([ruleName, ruleConfig]) => {
      const ruleDefinition = ruleRegistry[ruleName];
      if (ruleDefinition == null) {
        throw new Error(`Unable to find rule for ${ruleName}`);
      }
      const report = (nodeViolation: NodeViolation) =>
        violations.push({ ruleName, fileName, ...nodeViolation });
      const context = { fileName, report };
      const config = getRuleConfig(ruleConfig);
      const ruleInstance = ruleDefinition.create(config, context);
      return [ruleName, ruleInstance];
    });

  // Run each rule instance for each AST node.
  const models = listModelBlocks(schema);
  models.forEach((model) => {
    const comments = listIgnoreModelComments(model);
    if (isModelEntirelyIgnored(comments)) {
      return;
    }
    const fields = listFields(model);
    rules
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
    encoding: 'utf8',
  });
  return await lintSchemaSource({
    schemaSource,
    fileName,
    config,
    ruleRegistry,
  });
};
