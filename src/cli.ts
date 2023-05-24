#!/usr/bin/env node

import { program } from "commander";
import { lintSchemaFile } from "#src/lint.js";
import ruleRegistry from "#src/rule-registry.js";
import { renderViolations } from "#src/render.js";
import { cosmiconfig } from "cosmiconfig";

program
  .description("A linter for Prisma schema files.")
  .argument("<schemaFiles...>", "One or more schema files to lint.");

program.parse();

const explorer = cosmiconfig("prisma-lint");

const { args } = program;

const run = async () => {
  const result = await explorer.search("fixtures");
  if (result == null) {
    throw new Error("Failed to load config");
  }
  const { config } = result;
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
