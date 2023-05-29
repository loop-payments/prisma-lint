import type { Field, Model } from '@mrleebo/prisma-ast';

export type ModelViolation = { model: Model; message: string };
export type FieldViolation = {
  model: Model;
  field: Field;
  message: string;
};
export type NodeViolation = ModelViolation | FieldViolation;

export type Violation = {
  ruleName: string;
  fileName: string;
  model: Model;
  field?: Field;
  message: string;
};
