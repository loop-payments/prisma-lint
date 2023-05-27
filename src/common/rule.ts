import type { Model } from "@mrleebo/prisma-ast";

import type { RuleConfig } from "#src/common/config.js";

/**
 * Context passed to rules.
 */
export type Context = {
  fileName: string;
  report: (violation: ReportedViolation) => void;
};

/**
 * A "draft" violation, as reported by a rule.
 */
export type ReportedViolation = { node: Model; message?: string };

/**
 * Full violation, as returned by the linter.
 */
export type Violation = {
  /** The name of the rule. */
  ruleName: string;

  /**
   * The node with the violation.
   * Currently only Model nodes are supported.
   */
  node: Model;

  /** Description of the violation and possibly how to fix. */
  message: string;
};

export type RuleInstance = {
  Model: (model: Model) => void;
};

export type RuleDefinition = {
  create: (config: RuleConfig, context: Context) => RuleInstance;
};

export type RuleRegistry = Record<string, RuleDefinition>;
