#!/usr/bin/env node

import { program } from "commander";
import { lintSchemaFile } from "./lint.js";
import ruleRegistry from "./rule-registry.js";
import { renderViolations } from "./render.js";

program
  .description("A linter for Prisma schema files.")
  .argument("<schemaFiles...>", "One or more schema files to lint.");

program.parse();

const { args } = program;

const run = async () => {
  for (const arg of args) {
    const violations = await lintSchemaFile({ schemaFile: arg, ruleRegistry });
    const lines = renderViolations(violations);
    for (const line of lines) {
      console.log(line);
    }
  }
};

run().catch((err) => {
  console.error(err);
});

export default {};
