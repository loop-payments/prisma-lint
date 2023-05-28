#!/usr/bin/env node

import { program } from 'commander';

import { cosmiconfig } from 'cosmiconfig';

import { renderViolations } from '#src/common/render.js';
import { lintSchemaFile } from '#src/lint.js';
import ruleRegistry from '#src/rule-registry.js';

program
  .description('A linter for Prisma schema files.')
  .option('-c, --config <path>', 'Path to config file.')
  .argument('<paths...>', 'One or more schema files to lint.');

program.parse();

const explorer = cosmiconfig('prisma-lint');

const options = program.opts();
const { args } = program;

const getConfig = async () => {
  if (options.config != null) {
    const result = await explorer.load(options.config);
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

const run = async () => {
  const config = await getConfig();
  for (const arg of args) {
    const violations = await lintSchemaFile({
      schemaFile: arg,
      config,
      ruleRegistry,
    });
    const lines = renderViolations(violations);
    for (const line of lines) {
      // eslint-disable-next-line no-console
      console.log(line);
    }
  }
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
