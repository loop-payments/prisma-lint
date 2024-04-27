import type { Field, Model } from '@mrleebo/prisma-ast';

export type ModelViolation = {
  model: Model;
  message: string;
  fix?: never;
};

export type FixableModelViolation = {
  model: Model;
  message: string;
  fix: () => void;
};

export type FieldViolation = {
  model: Model;
  field: Field;
  message: string;
  fix?: never;
};

export type FixableFieldViolation = {
  model: Model;
  field: Field;
  message: string;
  fix: () => void;
};

export type NodeViolation =
  | ModelViolation
  | FixableModelViolation
  | FieldViolation
  | FixableFieldViolation;

export type Violation = {
  ruleName: string;
  fileName: string;
  model: Model;
  field?: Field;
  message: string;
  fix?: () => void;
};
