import chalk from 'chalk';

import { keyViolationListPairs } from '#src/common/render/render-util.js';
import type { Violation } from '#src/common/violation.js';

export const renderViolationsSimple = (violations: Violation[]): string[] => {
  const pairs = keyViolationListPairs(violations);
  return pairs.flatMap(([key, violations]) => {
    const first = violations[0];
    const location = first.field?.location ?? first.model.location;
    if (!location) {
      throw new Error('No location');
    }
    const { startLine, startColumn } = location;
    return [
      `  ${key} ${chalk.gray(`${startLine}:${startColumn}`)}`,
      ...violations.flatMap(renderViolationSimple),
    ];
  });
};

const renderViolationSimple = ({ ruleName, message }: Violation) => [
  `    ${chalk.red('error')} ${message} ${chalk.gray(`${ruleName}`)}`,
];
