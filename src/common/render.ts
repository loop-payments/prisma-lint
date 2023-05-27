import type { Model } from "@mrleebo/prisma-ast";

import type { Violation } from "#src/common/rule.js";

export const renderViolations = (violations: Violation[]) => {
  const groupedByModelName = violations.reduce((acc, v) => {
    const { node } = v;
    const model = node as Model;
    if (!acc[model.name]) {
      acc[model.name] = [];
    }
    acc[model.name].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);
  return Object.entries(groupedByModelName).flatMap(
    ([modelName, violations]) => {
      return [`${modelName}`, ...violations.flatMap(renderViolation), ""];
    }
  );
};

const renderViolation = ({ ruleName, message }: Violation) => [
  `  ${ruleName}`,
  `    ${message}`,
];
