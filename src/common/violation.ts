import type { Field, Model } from '@mrleebo/prisma-ast';

export type ModelViolation = { model: Model; message: string };
export type FieldViolation = {
  model: Model;
  field: Field;
  message: string;
};

/**
 * Full violation, as returned by the linter.
 */
export type Violation = {
  /** The name of the rule. */
  ruleName: string;

  /** The name of the file where the violation occurred. */
  fileName: string;

  /** The model where the violation occurred. */
  model: Model;

  /** The field where the violation occurred. */
  field?: Field;

  /** The message describing the violation. */
  message: string;
};
