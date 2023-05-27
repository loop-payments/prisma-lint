import type { Model } from '@mrleebo/prisma-ast';

/**
 * A "draft" violation, as reported by a rule.
 */
export type ReportedViolation = { node: Model; message: string };

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
