#!/usr/bin/env node

import fs from 'fs';
import { join as joinPath } from 'path';

import chalk from 'chalk';
import { program } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import { glob } from 'glob';

import { readPackageUp } from 'read-package-up';

import { getTruncatedFileName } from '#src/common/file.js';
import { parseRules } from '#src/common/parse-rules.js';
import { getSchemaPathFromPrismaConfig } from '#src/common/prisma-config.js';
import { lintPrismaFiles } from '#src/lint-prisma-files.js';
import { outputToConsole } from '#src/output/console.js';
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
  .option(
    '-o, --output-format <format>',
    'Output format. Options: simple, contextual, json, filepath, none.',
    'simple',
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

const getSchemaFromPackageJson = async (cwd: string) => {
  const pkgJson = await readPackageUp({ cwd });
  return pkgJson?.packageJson?.prisma?.schema;
};

/**
 * Gets the schema path from available configuration sources.
 * Priority order:
 * 1. prisma.config.ts (Prisma 7+)
 * 2. package.json#prisma.schema (legacy, deprecated in Prisma 7)
 * 3. null (will fall back to default)
 */
const getSchemaFromConfig = async (cwd: string) => {
  // First try prisma.config.ts (Prisma 7+)
  const schemaFromPrismaConfig = await getSchemaPathFromPrismaConfig(cwd);
  if (schemaFromPrismaConfig != null) {
    return schemaFromPrismaConfig;
  }

  // Fall back to package.json#prisma.schema (legacy)
  const schemaFromPackageJson = await getSchemaFromPackageJson(cwd);
  if (schemaFromPackageJson != null) {
    return schemaFromPackageJson;
  }

  return null;
};

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

const getPathsFromArgsOrConfig = async (args: string[]) => {
  if (args.length > 0) {
    return args;
  }
  const schemaFromConfig = await getSchemaFromConfig(process.cwd());
  if (schemaFromConfig != null) {
    return [schemaFromConfig];
  }
  return [DEFAULT_PRISMA_FILE_PATH];
};

const resolvePrismaFileNames = (paths: string[]) => {
  const resolvedFiles = [];

  for (const path of paths) {
    const isDirectory = fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    const isGlob = path.includes('*');

    if (isDirectory) {
      const filesInDirectory = glob.sync(joinPath(path, '**/*.prisma'));
      resolvedFiles.push(...filesInDirectory);
    } else if (isGlob) {
      const filesMatchingGlob = glob.sync(path);
      resolvedFiles.push(...filesMatchingGlob);
    } else {
      resolvedFiles.push(path);
    }
  }

  resolvedFiles.sort();

  return resolvedFiles;
};

const outputParseIssues = (filepath: string, parseIssues: string[]) => {
  const truncatedFileName = getTruncatedFileName(filepath);
  // eslint-disable-next-line no-console
  console.error(`${truncatedFileName} ${chalk.red('✖')}`);
  for (const parseIssue of parseIssues) {
    // eslint-disable-next-line no-console
    console.error(`  ${parseIssue.replaceAll('\n', '\n  ')}`);
  }
  process.exit(1);
};

const run = async () => {
  if (!options.color) {
    chalk.level = 0;
  }
  const { quiet, outputFormat } = options;
  const rootConfig = await getRootConfigResult();
  if (rootConfig == null) {
    // eslint-disable-next-line no-console
    console.error(
      'Unable to find configuration file for prisma-lint. Please create a ".prismalintrc.json" file.',
    );
    process.exit(1);
  }
  const { rules, parseIssues, deprecationWarnings } = parseRules(
    ruleDefinitions,
    rootConfig.config,
  );
  if (parseIssues.length > 0) {
    outputParseIssues(rootConfig.filepath, parseIssues);
  }

  // Output deprecation warnings
  if (deprecationWarnings.length > 0 && !quiet) {
    for (const warning of deprecationWarnings) {
      // eslint-disable-next-line no-console
      console.error(chalk.yellow(`Warning: ${warning}`));
    }
  }

  const paths = await getPathsFromArgsOrConfig(args);
  const fileNames = resolvePrismaFileNames(paths);
  const fileViolationList = await lintPrismaFiles({
    rules,
    fileNames,
  });

  outputToConsole(fileViolationList, outputFormat, quiet);

  const hasViolations = fileViolationList.some(
    ({ violations }) => violations.length > 0,
  );
  if (hasViolations) {
    process.exit(1);
  }
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  // Something's wrong with prisma-lint.
  process.exit(2);
});
