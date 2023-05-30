import fs from 'fs';
import path from 'path';

import { promisify } from 'util';

import type { Rule } from '#src/common/rule.js';

import type { Violation } from '#src/common/violation.js';
import { lintPrismaSourceCode } from '#src/lint-prisma-source-code.js';

type FileViolations = { fileName: string; violations: Violation[] }[];

export const lintPrismaFiles = async ({
  rules,
  fileNames,
}: {
  rules: Rule[];
  fileNames: string[];
}): Promise<FileViolations> => {
  const fileViolationList: FileViolations = [];
  for (const fileName of fileNames) {
    const violations = await lintPrismaFile({
      rules,
      fileName,
    });
    fileViolationList.push({ fileName, violations });
  }
  return fileViolationList;
};

const lintPrismaFile = async ({
  rules,
  fileName,
}: {
  rules: Rule[];
  fileName: string;
}): Promise<Violation[]> => {
  const filePath = path.resolve(fileName);
  const sourceCode = await promisify(fs.readFile)(filePath, {
    encoding: 'utf8',
  });
  return lintPrismaSourceCode({ rules, fileName, sourceCode });
};
