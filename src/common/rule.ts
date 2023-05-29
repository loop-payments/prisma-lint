import type { Field, Model } from '@mrleebo/prisma-ast';

import type { z } from 'zod';

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

export type ModelRuleDefinition<T> = {
  ruleName: string;
  configSchema: z.ZodSchema<T>;
  create: (
    config: T,
    context: RuleContext<ModelViolation>,
  ) => ModelRuleInstance;
};

export type ModelRuleInstance = {
  Model: (model: Model) => void;
};

export type FieldRuleDefinition<T> = {
  ruleName: string;
  configSchema: z.ZodSchema<T>;
  create: (
    config: T,
    context: RuleContext<FieldViolation>,
  ) => FieldRuleInstance;
};

export type FieldRuleInstance = {
  Field: (model: Model, field: Field) => void;
};

export type RuleDefinition<T> = ModelRuleDefinition<T> | FieldRuleDefinition<T>;
export type RuleInstance = ModelRuleInstance | FieldRuleInstance;

export type RuleRegistry = Record<string, RuleDefinition<any>>;
