import type { Field, Model } from '@mrleebo/prisma-ast';

import type { z } from 'zod';

import type { RuleConfig } from '#src/common/config.js';
import type {
  FieldViolation,
  FixableFieldViolation,
  ModelViolation,
  NodeViolation,
} from '#src/common/violation.js';

export type Rule = { ruleConfig: RuleConfig; ruleDefinition: RuleDefinition };

/**
 * Context passed to rules.
 */
export type RuleContext<V extends NodeViolation> = {
  fileName: string;
  sourceCode: string;
  report: (nodeViolation: V) => void;
};

export type ModelRuleDefinition<C> = {
  ruleName: string;
  configSchema: z.ZodSchema<C>;
  create: (
    config: C,
    context: RuleContext<ModelViolation>,
  ) => ModelRuleInstance;
};

export type ModelRuleInstance = {
  Model: (model: Model) => void;
};

export type FieldRuleDefinition<
  C,
  V extends FieldViolation | FixableFieldViolation = FieldViolation,
> = {
  ruleName: string;
  configSchema: z.ZodSchema<C>;
  create: (config: C, context: RuleContext<V>) => FieldRuleInstance;
};

export type FieldRuleInstance = {
  Field: (model: Model, field: Field) => void;
};

export type RuleDefinition =
  | ModelRuleDefinition<any>
  | FieldRuleDefinition<any, any>;
export type RuleInstance = ModelRuleInstance | FieldRuleInstance;
