#!/usr/bin/env node

import { program } from "commander";
import { lintSchemaFile } from "#src/lint.js";
import ruleRegistry from "#src/rule-registry.js";
import { renderViolations } from "#src/render.js";
import { cosmiconfig } from "cosmiconfig";

program
  .description("A linter for Prisma schema files.")
  .option("-c, --config <path>", "Path to config file.")
  .argument("<paths...>", "One or more schema files to lint.");

program.parse();

const explorer = cosmiconfig("prisma-lint");

const options = program.opts();
const { args } = program;

const getConfig = async () => {
  if (options.config != null) {
    const result = await explorer.load(options.config);
    if (result == null) {
      throw new Error("Failed to load config");
    }
    return result.config;
  }

  const result = await explorer.search();
  if (result == null) {
    throw new Error("Failed to load config");
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
      console.log(line);
    }
  }
};

run().catch((err) => {
  console.error(err);
});
