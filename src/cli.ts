#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { program } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import { glob } from 'glob';

import { parseRuleConfigList } from '#src/common/config.js';
import { renderViolations } from '#src/common/render.js';
import type { Violation } from '#src/common/violation.js';
import { lintPrismaFiles } from '#src/lint.js';
import ruleRegistry from '#src/rule-registry.js';

program
  .name('prisma-lint')
  .description('A linter for Prisma schema files.')
  .option(
    '-e, --explicit-config <path>',
    'An explicit path to a config file. ' +
      'If omitted, cosmiconfig is used to search for a config file.',
  )
  .argument(
    '[paths...]',
    'One or more schema files, directories, or globs to lint.',
    './prisma/schema.prisma',
  );

program.parse();

const explorer = cosmiconfig('prismalint');

const options = program.opts();
const args = program.processedArgs;

const getConfig = async () => {
  if (options.explicitConfig != null) {
    const result = await explorer.load(options.explicitConfig);
    if (result == null) {
      throw new Error('Configuration file for prisma-lint not found');
    }
    return result.config;
  }

  const result = await explorer.search();
  if (result == null) {
    throw new Error('Configuration file for prisma-lint not found');
  }
  return result.config;
};

const resolvePrismaFiles = (schemaFiles: string[]) => {
  const resolvedFiles = [];

  for (const file of schemaFiles) {
    const isDirectory = fs.existsSync(file) && fs.lstatSync(file).isDirectory();
    const isGlob = file.includes('*');

    if (isDirectory) {
      const filesInDirectory = glob.sync(path.join(file, '**/*.prisma'));
      resolvedFiles.push(...filesInDirectory);
    } else if (isGlob) {
      const filesMatchingGlob = glob.sync(file);
      resolvedFiles.push(...filesMatchingGlob);
    } else {
      resolvedFiles.push(file);
    }
  }

  return resolvedFiles.sort();
};

const printFileViolations = (schemaFile: string, violations: Violation[]) => {
  /* eslint-disable no-console */
  console.log(schemaFile);
  const lines = renderViolations(violations);
  for (const line of lines) {
    console.log(line);
  }
  console.log('');
  /* eslint-enable no-console */
};

const run = async () => {
  const config = await getConfig();
  const { ruleConfigList, parseIssues } = parseRuleConfigList(
    ruleRegistry,
    config,
  );
  if (parseIssues.length > 0) {
    for (const parseIssue of parseIssues) {
      // eslint-disable-next-line no-console
      console.error(parseIssue);
    }
    process.exit(1);
  }

  const fileNames = resolvePrismaFiles(args);
  const fileViolationList = await lintPrismaFiles({
    fileNames,
    ruleConfigList,
    ruleRegistry,
  });
  let hasViolations = false;
  fileViolationList.forEach(([fileName, violations]) => {
    if (violations.length > 0) {
      hasViolations = true;
      printFileViolations(fileName, violations);
    }
  });
  if (hasViolations) {
    process.exit(1);
  }
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
