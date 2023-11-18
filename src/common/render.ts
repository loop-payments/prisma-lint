import type { Violation } from '#src/common/violation.js';

export const renderViolations = (
  sourceCode: string,
  violations: Violation[],
  outputFormat: 'simple' | 'contextual' | 'json' | 'none',
): string => {
  switch (outputFormat) {
    case 'contextual':
      throw new Error('Not implemented');
    case 'simple':
      return renderViolationsSimple(violations);
    case 'json':
      return renderViolationsJson(violations);
    case 'none':
      return '';
  }
};

export const renderViolationsJson = (violations: Violation[]) => {
  const jsonObject = renderViolationsJsonObject(violations);
  return JSON.stringify(jsonObject);
}

export const renderViolationsJsonObject = (
  violations: Violation[],
): Record<string, any>[] => {
  const pairs = keyViolationListPairs(violations);
  return pairs.flatMap(([_, violations]) => {
    const first = violations[0];
    const { fileName } = first;
    const rawLocation = first.field?.location ?? first.model.location;
    if (!rawLocation) {
      throw new Error('No location');
    }
    const {
      startLine,
      startColumn,
      startOffset,
      endLine,
      endColumn,
      endOffset,
    } = rawLocation;
    const location = {
      startLine,
      startColumn,
      startOffset,
      endLine,
      endColumn,
      endOffset,
    };
    return violations.map((v) => ({
      ruleName: v.ruleName,
      message: v.message,
      fileName,
      location,
    }));
  });
};

const keyViolationListPairs = (
  violations: Violation[],
): [string, Violation[]][] => {
  const groupedByKey = violations.reduce(
    (acc, violation) => {
      const { ruleName } = violation;
      if (!acc[ruleName]) {
        acc[ruleName] = [];
      }
      acc[ruleName].push(violation);
      return acc;
    },
    {} as Record<string, Violation[]>,
  );
  return Object.entries(groupedByKey).sort();
};

export const renderViolationsSimple = (violations: Violation[]) => {
  const pairs = keyViolationListPairs(violations);
  return pairs.flatMap(([key, violations]) => {
    return [`  ${key}`, ...violations.flatMap(renderViolationSimple)];
  }).join('\n');
};

const renderViolationSimple = ({ ruleName, message }: Violation) => [
  `    ${ruleName}`,
  `      ${message}`,
];
