import chalk from 'chalk';

import { getTruncatedFileName } from '#src/common/file.js';
import type { OutputFormat } from '#src/common/output-format.js';
import { renderViolations } from '#src/common/render.js';
import type { Violation } from '#src/common/violation.js';
import type { FileViolationList } from '#src/lint-prisma-files.js';

/* eslint-disable no-console */

export function outputToConsole(
  fileViolationList: FileViolationList,
  outputFormat: OutputFormat,
  quiet: boolean,
) {
  if (outputFormat === 'none') {
    return;
  }
  const shouldPrintFileName = ['file', 'simple'].includes(outputFormat);
  fileViolationList.forEach(({ fileName, violations, sourceCode }) => {
    const truncatedFileName = getTruncatedFileName(fileName);
    if (shouldPrintFileName) {
      printFileName(truncatedFileName, violations, quiet);
    }
    if (outputFormat === 'file') {
      return;
    }
    const output = renderViolations(sourceCode, violations, outputFormat);
    if (output === '') {
      return;
    }
    console.error(output);
  });
}

function printFileName(
  fileName: string,
  violations: Violation[],
  quiet: boolean,
) {
  if (violations.length > 0) {
    console.error(`${fileName} ${chalk.red('✖')}`);
    return;
  }
  if (quiet) {
    return;
  }
  console.log(`${fileName} ${chalk.green('✔')}`);
}
