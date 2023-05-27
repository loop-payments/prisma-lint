import type { Field, Model } from '@mrleebo/prisma-ast';

import type { RuleConfig } from '#src/common/config.js';

import type { FieldViolation, ModelViolation } from '#src/common/violation.js';

/**
 * Context passed to rules.
 */
export type RuleContext = {
  fileName: string;
  report: (violation: ModelViolation | FieldViolation) => void;
};

export type RuleInstance =
  | {
      Model: (model: Model) => void;
    }
  | {
      Field: (field: Field) => void;
    };

export type RuleDefinition = {
  create: (config: RuleConfig, context: RuleContext) => RuleInstance;
};

export type RuleRegistry = Record<string, RuleDefinition>;
