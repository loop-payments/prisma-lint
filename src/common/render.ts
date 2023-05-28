import type { Violation } from '#src/common/violation.js';

export const renderViolations = (violations: Violation[]) => {
  const groupedByKey = violations.reduce((acc, violation) => {
    const { model, field } = violation;
    const key = field ? `${model.name}.${field.name}` : model.name;
    const violations = acc[key] ?? [];
    return { ...acc, [key]: [...violations, violation] };
  }, {} as Record<string, Violation[]>);
  return Object.entries(groupedByKey)
    .sort()
    .flatMap(([key, violations]) => {
      return [`  ${key}`, ...violations.flatMap(renderViolation)];
    });
};

const renderViolation = ({ ruleName, message }: Violation) => [
  `    ${ruleName}`,
  `      ${message}`,
];
