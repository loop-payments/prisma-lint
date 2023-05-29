#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { program } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import { glob } from 'glob';

import { renderViolations } from '#src/common/render.js';
import type { Violation } from '#src/common/violation.js';
import { lintSchemaFile } from '#src/lint.js';
import ruleRegistry from '#src/rule-registry.js';

program
  .description('A linter for Prisma schema files.')
  .option(
    '-c, --check',
    'Exit with a non-zero exit code if any violations are found.',
  )
  .option(
    '-e, --explicit-config <path>',
    'An explicit path to a config file. ' +
      'If omitted, cosmiconfig is used to search for a config file.',
  )
  .argument(
    '[paths...]',
    'One or more schema files, directories, or globs to lint.',
    'prisma/schema.prisma',
  );

program.parse();

const explorer = cosmiconfig('prismalint');

const options = program.opts();
const { args } = program;

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

const resolveSchemaFiles = (schemaFiles: string[]) => {
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
  const schemaFiles = resolveSchemaFiles(args);
  let hasViolations = false;
  for (const schemaFile of schemaFiles) {
    const violations = await lintSchemaFile({
      schemaFile,
      config,
      ruleRegistry,
    });
    if (violations.length > 0) {
      hasViolations = true;
      printFileViolations(schemaFile, violations);
    }
  }
  if (hasViolations) {
    process.exit(1);
  }
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
