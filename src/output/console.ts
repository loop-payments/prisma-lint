import chalk from 'chalk';

import { getTruncatedFileName } from '#src/common/file.js';
import type { Violation } from '#src/common/violation.js';
import type { FileViolationList } from '#src/lint-prisma-files.js';
import type { OutputFormat } from '#src/output/output-format.js';
import { renderViolationsContextual } from '#src/output/render/render-contextual.js';
import { renderViolationsJsonObject } from '#src/output/render/render-json.js';
import { renderViolationsSimple } from '#src/output/render/render-simple.js';

/* eslint-disable no-console */

export function outputToConsole(
  fileViolationList: FileViolationList,
  outputFormat: OutputFormat,
  quiet: boolean,
) {
  switch (outputFormat) {
    case 'filepath':
      outputFilepath(fileViolationList, quiet);
      break;
    case 'simple':
      outputSimple(fileViolationList, quiet);
      break;
    case 'contextual':
      outputContextual(fileViolationList);
      break;
    case 'json':
      outputJson(fileViolationList);
      break;
    case 'none':
      break;
    default:
      throw new Error(`Unknown output format: ${outputFormat}`);
  }
}

function outputFilepath(fileViolationList: FileViolationList, quiet: boolean) {
  fileViolationList.forEach(({ fileName, violations }) => {
    maybeOutputPath(fileName, violations, quiet);
  });
}

function outputJson(fileViolationList: FileViolationList) {
  const list = fileViolationList.flatMap(({ violations }) =>
    renderViolationsJsonObject(violations),
  );
  console.error(JSON.stringify(list));
}

function outputSimple(fileViolationList: FileViolationList, quiet: boolean) {
  fileViolationList.forEach(({ fileName, violations }) => {
    const truncatedFileName = getTruncatedFileName(fileName);
    maybeOutputPath(truncatedFileName, violations, quiet);
    const lines = renderViolationsSimple(violations);
    console.error(lines.join('\n'));
  });
}

function outputContextual(fileViolationList: FileViolationList) {
  fileViolationList.forEach(({ sourceCode, violations }) => {
    const lines = renderViolationsContextual(sourceCode, violations);
    console.error(lines.join('\n'));
  });
}

function maybeOutputPath(
  fileName: string,
  violations: Violation[],
  quiet: boolean,
) {
  const truncatedFileName = getTruncatedFileName(fileName);
  if (violations.length > 0) {
    console.error(`${truncatedFileName} ${chalk.red('✖')}`);
    return;
  }
  if (quiet) {
    return;
  }
  console.log(`${truncatedFileName} ${chalk.green('✔')}`);
}
