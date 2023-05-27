import type { Field, Model } from '@mrleebo/prisma-ast';

import type { RuleConfig } from '#src/common/config.js';

import type { FieldViolation, ModelViolation } from '#src/common/violation.js';

/**
 * Context passed to rules.
 */
export type RuleContext<V extends ModelViolation | FieldViolation> = {
  fileName: string;
  report: (violation: V) => void;
};

export type ModelRuleDefinition = {
  create: (
    config: RuleConfig,
    context: RuleContext<ModelViolation>,
  ) => ModelRuleInstance;
};

export type ModelRuleInstance = {
  Model: (model: Model) => void;
};

export type FieldRuleDefinition = {
  create: (
    config: RuleConfig,
    context: RuleContext<FieldViolation>,
  ) => FieldRuleInstance;
};

export type FieldRuleInstance = {
  Field: (field: Field) => void;
};

export type RuleDefinition = ModelRuleDefinition | FieldRuleDefinition;
export type RuleInstance = ModelRuleInstance | FieldRuleInstance;

export type RuleRegistry = Record<string, RuleDefinition>;
