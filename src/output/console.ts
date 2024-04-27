import chalk from 'chalk';

import { getTruncatedFileName } from '#src/common/file.js';
import type { Violation } from '#src/common/violation.js';
import type { FileResult } from '#src/lint-prisma-files.js';
import type { OutputFormat } from '#src/output/output-format.js';
import { renderViolationsContextual } from '#src/output/render/render-contextual.js';
import { renderViolationsJsonObject } from '#src/output/render/render-json.js';
import { renderViolationsSimple } from '#src/output/render/render-simple.js';

/* eslint-disable no-console */

export function outputToConsole(
  fileResults: FileResult[],
  outputFormat: OutputFormat,
  quiet: boolean,
) {
  switch (outputFormat) {
    case 'filepath':
      outputFilepath(fileResults, quiet);
      break;
    case 'simple':
      outputSimple(fileResults, quiet);
      break;
    case 'contextual':
      outputContextual(fileResults);
      break;
    case 'json':
      outputJson(fileResults);
      break;
    case 'none':
      break;
    default:
      throw new Error(`Unknown output format: ${outputFormat}`);
  }
}

function outputFilepath(fileResults: FileResult[], quiet: boolean) {
  fileResults.forEach(({ fileName, violations }) => {
    maybeOutputPath(fileName, violations, quiet);
  });
}

function outputJson(fileResults: FileResult[]) {
  const list = fileResults.flatMap(({ violations }) =>
    renderViolationsJsonObject(violations),
  );
  console.error(JSON.stringify({ violations: list }));
}

function outputSimple(fileResults: FileResult[], quiet: boolean) {
  fileResults.forEach(({ fileName, violations }) => {
    const truncatedFileName = getTruncatedFileName(fileName);
    maybeOutputPath(truncatedFileName, violations, quiet);
    const lines = renderViolationsSimple(violations);
    if (lines.length !== 0) {
      console.error(lines.join('\n'));
    }
  });
}

function outputContextual(fileResults: FileResult[]) {
  fileResults.forEach(({ sourceCode, violations }) => {
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
