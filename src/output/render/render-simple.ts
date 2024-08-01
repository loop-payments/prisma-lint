import chalk from 'chalk';

import type { Violation } from '#src/common/violation.js';
import { keyViolationListPairs } from '#src/output/render/render-util.js';

export const renderViolationsSimple = (violations: Violation[]): string[] => {
  const pairs = keyViolationListPairs(violations);
  return pairs.flatMap(([key, violations]) => {
    const first = violations[0];
    const location =
      first.field?.location ?? first.model?.location ?? first.enum?.location;
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
