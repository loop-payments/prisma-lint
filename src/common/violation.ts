import type { Enum, Field, Model } from '@mrleebo/prisma-ast';

export type EnumViolation = { enum: Enum; message: string };
export type ModelViolation = { model: Model; message: string };
export type FieldViolation = {
  model: Model;
  field: Field;
  message: string;
};
export type NodeViolation = EnumViolation | ModelViolation | FieldViolation;

export type Violation = {
  ruleName: string;
  fileName: string;
  message: string;
} & (
  | {
      model: Model;
      field?: Field;
      enum?: undefined;
    }
  | {
      model?: undefined;
      field?: undefined;
      enum: Enum;
    }
);
