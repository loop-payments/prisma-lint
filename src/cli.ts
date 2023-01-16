#!/usr/bin/env node

import { program } from "commander";
import { lintSchemaFile } from "./lint";
import ruleRegistry from "src/rule-registry";
import { renderViolations } from "src/render";

program
  .description("A linter for Prisma schema files.")
  .argument("<schemaFiles...>", "One or more schema files to lint.");

program.parse();

const { args } = program;

for (const arg of args) {
  const violations = await lintSchemaFile({ schemaFile: arg, ruleRegistry });
  console.log(renderViolations(violations));
}
