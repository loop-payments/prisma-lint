import type { Violation } from '#src/common/violation.js';
import chalk from 'chalk';

export const renderViolations = (
  sourceCode: string,
  violations: Violation[],
  outputFormat: 'simple' | 'contextual' | 'json' | 'none',
): string => {
  switch (outputFormat) {
    case 'contextual':
      return renderViolationsContextual(sourceCode, violations);
    case 'simple':
      return renderViolationsSimple(violations);
    case 'json':
      return renderViolationsJson(violations);
    case 'none':
      return '';
  }
};

export const renderViolationsContextual = (
  sourceCode: string,
  violations: Violation[],
): string => {
  const pairs = keyViolationListPairs(violations);
  const lines = pairs.flatMap(([key, violations]) => {
    const first = violations[0];
    const { fileName } = first;
    const rawLocation = first.field?.location ?? first.model.location;
    if (!rawLocation) {
      throw new Error('No location');
    }
    const { startLine, startColumn, endLine, endColumn, startOffset, endOffset } = rawLocation;
    if (!startLine || !startColumn || !endLine || !endColumn || !startOffset || !endOffset) {
      throw new Error('No line or column');
    }
    const lines = sourceCode.split('\n');
    const containingLine = lines[startLine - 1];
    const pointer = ' '.repeat(startColumn - 1) + '^'.repeat(endColumn - startColumn + 1);
    return [
      '',
      `${fileName}:${startLine}:${startColumn} ${chalk.gray(`${key}`)}`,
      `${containingLine}`,
      `${pointer}`,
    ].concat(violations.flatMap((violation) => {
      const { ruleName, message } = violation;
      return [
        `  ${chalk.red('error')} ${message} ${chalk.gray(`${ruleName}`)}`
      ];
    }));
  });
  return lines.join('\n');
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
      const { model, field } = violation;
      const key = field ? `${model.name}.${field.name}` : model.name;
      const violations = acc[key] ?? [];
      return { ...acc, [key]: [...violations, violation] };
    },
    {} as Record<string, Violation[]>,
  );
  return Object.entries(groupedByKey).sort();
};

export const renderViolationsSimple = (violations: Violation[]) => {
  const pairs = keyViolationListPairs(violations);
  return pairs.flatMap(([key, violations]) => {
    const first = violations[0];
    const location = first.field?.location ?? first.model.location;
    if (!location) {
      throw new Error('No location');
    }
    const { startLine, startColumn } = location;
    return [`  ${key} ${chalk.gray(`${startLine}:${startColumn}`)}`, ...violations.flatMap(renderViolationSimple)];
  }).join('\n');
};

const renderViolationSimple = ({ ruleName, message }: Violation) => [
  `   ${chalk.red('error')} ${message} ${chalk.gray(`${ruleName}`)}`,
];
