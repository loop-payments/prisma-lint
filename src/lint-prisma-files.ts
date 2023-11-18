import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import type { Rule } from '#src/common/rule.js';

import type { Violation } from '#src/common/violation.js';
import { lintPrismaSourceCode } from '#src/lint-prisma-source-code.js';

export type FileViolationList = {
  fileName: string;
  sourceCode: string;
  violations: Violation[];
}[];

export const lintPrismaFiles = async ({
  rules,
  fileNames,
}: {
  rules: Rule[];
  fileNames: string[];
}): Promise<FileViolationList> => {
  const fileViolationList: FileViolationList = [];
  for (const fileName of fileNames) {
    const filePath = path.resolve(fileName);
    const sourceCode = await promisify(fs.readFile)(filePath, {
      encoding: 'utf8',
    });
    const violations = lintPrismaSourceCode({ fileName, sourceCode, rules });
    fileViolationList.push({ fileName, sourceCode, violations });
  }
  return fileViolationList;
};
