import type { Violation } from '#src/common/violation.js';

export const keyViolationListPairs = (
  violations: Violation[],
): [string, Violation[]][] => {
  const groupedByKey = violations.reduce(
    (acc, violation) => {
      const { model, field, enum: enumObj } = violation;
      const key = field
        ? `${model.name}.${field.name}`
        : enumObj
          ? enumObj.name
          : model.name;
      const violations = acc[key] ?? [];
      return { ...acc, [key]: [...violations, violation] };
    },
    {} as Record<string, Violation[]>,
  );
  return Object.entries(groupedByKey).sort();
};
