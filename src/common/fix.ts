import { writeFile } from 'fs';
import { promisify } from 'node:util';

import { printPrismaSchema } from '#src/common/print-prisma-schema.js';
import type { FileResult } from '#src/lint-prisma-files.js';

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
