import type { Model } from '@mrleebo/prisma-ast';

import type { RuleConfig } from '#src/common/config.js';

import type { ReportedViolation } from '#src/common/violation.js';

/**
 * Context passed to rules.
 */
export type RuleContext = {
  fileName: string;
  report: (violation: ReportedViolation) => void;
};

export type RuleInstance = {
  Model: (model: Model) => void;
};

export type RuleDefinition = {
  create: (config: RuleConfig, context: RuleContext) => RuleInstance;
};

export type RuleRegistry = Record<string, RuleDefinition>;
