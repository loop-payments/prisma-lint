import type { Field, Model } from '@mrleebo/prisma-ast';

import type { RuleConfig } from '#src/common/config.js';

import type {
  FieldViolation,
  ModelViolation,
  NodeViolation,
} from '#src/common/violation.js';

/**
 * Context passed to rules.
 */
export type RuleContext<T extends NodeViolation> = {
  fileName: string;
  report: (nodeViolation: T) => void;
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
  Field: (model: Model, field: Field) => void;
};

export type RuleDefinition = ModelRuleDefinition | FieldRuleDefinition;
export type RuleInstance = ModelRuleInstance | FieldRuleInstance;

export type RuleRegistry = Record<string, RuleDefinition>;
