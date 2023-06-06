#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import { program } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import { glob } from 'glob';

import { parseRules } from '#src/common/parse-rules.js';
import { renderViolations } from '#src/common/render.js';
import { lintPrismaFiles } from '#src/lint-prisma-files.js';
import ruleDefinitions from '#src/rule-definitions.js';

const DEFAULT_PRISMA_FILE_PATH = 'prisma/schema.prisma';

program
  .name('prisma-lint')
  .description('A linter for Prisma schema files.')
  .option(
    '-c, --config <path>',
    'A path to a config file. ' +
      'If omitted, cosmiconfig is used to search for a config file.',
  )
  .option('--no-color', 'Disable color output.')
  .option('--quiet', 'Suppress all output except for errors.')
  .argument(
    '[paths...]',
    'One or more schema files, directories, or globs to lint.',
    DEFAULT_PRISMA_FILE_PATH,
  );

program.parse();

const explorer = cosmiconfig('prismalint');

const options = program.opts();
const { args } = program;

const getRootConfigResult = async () => {
  if (options.config != null) {
    const result = await explorer.load(options.config);
    if (result == null) {
      return;
    }
    return result;
  }

  const result = await explorer.search();
  if (result == null) {
    return;
  }
  return result;
};

const resolvePrismaFiles = (args: string[]) => {
  if (args.length == 0) {
    return [DEFAULT_PRISMA_FILE_PATH];
  }

  const resolvedFiles = [];

  for (const file of args) {
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

  resolvedFiles.sort();

  return resolvedFiles;
};

function getTruncatedFileName(fileName: string) {
  const cwd = process.cwd();
  return fileName.includes(cwd)
    ? path.relative(process.cwd(), fileName)
    : fileName;
}

/* eslint-disable no-console */

const run = async () => {
  if (!options.color) {
    chalk.level = 0;
  }
  const { quiet } = options;
  const rootConfig = await getRootConfigResult();
  if (rootConfig == null) {
    console.error(
      `Unable to find configuration file for prisma-lint. Please create a ".prismalintrc.json" file.`,
    );
    process.exit(1);
  }
  const { rules, parseIssues } = parseRules(ruleDefinitions, rootConfig.config);
  if (parseIssues.length > 0) {
    const truncatedFileName = getTruncatedFileName(rootConfig.filepath);
    console.error(`${truncatedFileName} ${chalk.red('✖')}`);
    for (const parseIssue of parseIssues) {
      console.error(`  ${parseIssue.replaceAll('\n', '\n  ')}`);
    }
    process.exit(1);
  }

  const fileNames = resolvePrismaFiles(args);
  const fileViolationList = await lintPrismaFiles({
    rules,
    fileNames,
  });
  let hasViolations = false;
  fileViolationList.forEach(({ fileName, violations }) => {
    const truncatedFileName = getTruncatedFileName(fileName);
    if (violations.length > 0) {
      hasViolations = true;
      console.error(`${truncatedFileName} ${chalk.red('✖')}`);
      const lines = renderViolations(violations);
      for (const line of lines) {
        console.error(line);
      }
    } else {
      if (!quiet) {
        console.log(`${truncatedFileName} ${chalk.green('✔')}`);
      }
    }
  });
  if (hasViolations) {
    process.exit(1);
  }
};

run().catch((err) => {
  console.error(err);
  // Something's wrong with prisma-lint.
  process.exit(2);
});
