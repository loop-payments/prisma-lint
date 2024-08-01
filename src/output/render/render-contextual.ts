import chalk from 'chalk';

import type { Violation } from '#src/common/violation.js';
import { keyViolationListPairs } from '#src/output/render/render-util.js';

export const renderViolationsContextual = (
  sourceCode: string,
  violations: Violation[],
): string[] => {
  const pairs = keyViolationListPairs(violations);
  const lines = pairs.flatMap(([key, violations]) => {
    const first = violations[0];
    const { fileName } = first;
    const rawLocation =
      first.field?.location ?? first.model?.location ?? first.enum?.location;
    if (!rawLocation) {
      throw new Error('No location');
    }
    const {
      startLine,
      startColumn,
      endLine,
      endColumn,
      startOffset,
      endOffset,
    } = rawLocation;
    if (
      !startLine ||
      !startColumn ||
      !endLine ||
      !endColumn ||
      !startOffset ||
      !endOffset
    ) {
      throw new Error('No line or column');
    }
    const lines = sourceCode.split('\n');
    const containingLine = lines[startLine - 1];
    const pointer =
      ' '.repeat(startColumn - 1) + '^'.repeat(endColumn - startColumn + 1);
    return [
      '',
      `${fileName}:${startLine}:${startColumn} ${chalk.gray(`${key}`)}`,
      `${containingLine}`,
      `${pointer}`,
    ].concat(
      violations.flatMap((violation) => {
        const { ruleName, message } = violation;
        return [
          `  ${chalk.red('error')} ${message} ${chalk.gray(`${ruleName}`)}`,
        ];
      }),
    );
  });
  return lines;
};
