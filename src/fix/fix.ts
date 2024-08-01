import { writeFile } from 'fs';
import { promisify } from 'node:util';

import pluralize from 'pluralize';

import { printPrismaSchema } from '#src/common/print-prisma-schema.js';
import type { Rule } from '#src/common/rule.js';
import { lintPrismaFiles, type FileResult } from '#src/lint-prisma-files.js';
import type { OutputFormat } from '#src/output/output-format.js';

export async function fixFilesUntilStable(input: {
  rules: Rule[];
  fileNames: string[];
}) {
  const fileResults = await lintPrismaFiles(input);
  // TODO - fix in a loop
  return fileResults;
}

export async function fixFiles(
  fileResults: FileResult[],
  // TODO: Respect output format while fixing.
  _outputFormat: OutputFormat,
  _quiet: boolean,
) {
  // eslint-disable-next-line no-console
  console.log('\nAttempting to automatically fix violations...');
  for (const fileResult of fileResults) {
    const fixedCount = applyFixesToPrismaSchema(fileResult);
    if (fixedCount > 0) {
      await overwriteSourceCode(fileResult);
    }
    // eslint-disable-next-line no-console
    console.log(
      `Fixed ${fixedCount} ${pluralize('violations', fixedCount)} in ${
        fileResult.fileName
      }`,
    );
  }
}

export function applyFixesToPrismaSchema(fileResult: FileResult): number {
  let fixedCount = 0;
  for (const violation of fileResult.violations) {
    if (violation.fix != null) {
      violation.fix();
      fixedCount++;
    }
  }
  return fixedCount;
}

export async function overwriteSourceCode(fileResult: FileResult) {
  const source = printPrismaSchema(fileResult.prismaSchema);
  await promisify(writeFile)(fileResult.fileName, source);
}
