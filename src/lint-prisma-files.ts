import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import type { PrismaSchema } from '#src/common/get-prisma-schema.js';
import type { Rule } from '#src/common/rule.js';

import type { Violation } from '#src/common/violation.js';
import { lintPrismaSourceCode } from '#src/lint-prisma-source-code.js';

export type FileResult = {
  fileName: string;
  sourceCode: string;
  prismaSchema: PrismaSchema;
  violations: Violation[];
};

export const lintPrismaFiles = async ({
  rules,
  fileNames,
}: {
  rules: Rule[];
  fileNames: string[];
}): Promise<FileResult[]> => {
  const fileResults: FileResult[] = [];
  for (const fileName of fileNames) {
    const filePath = path.resolve(fileName);
    const sourceCode = await promisify(fs.readFile)(filePath, {
      encoding: 'utf8',
    });
    const { violations, prismaSchema } = lintPrismaSourceCode({
      fileName,
      sourceCode,
      rules,
    });
    fileResults.push({ fileName, sourceCode, violations, prismaSchema });
  }
  return fileResults;
};
