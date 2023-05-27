import type { Violation } from '#src/common/violation.js';

export const renderViolations = (violations: Violation[]) => {
  const groupedByModelName = violations.reduce((acc, v) => {
    const { model } = v;
    if (!acc[model.name]) {
      acc[model.name] = [];
    }
    acc[model.name].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);
  return Object.entries(groupedByModelName).flatMap(
    ([modelName, violations]) => {
      return [`${modelName}`, ...violations.flatMap(renderViolation), ''];
    },
  );
};

const renderViolation = ({ ruleName, message }: Violation) => [
  `  ${ruleName}`,
  `    ${message}`,
];
