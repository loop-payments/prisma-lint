import type { Model } from "@mrleebo/prisma-ast";
import type { Violation } from "#src/util.js";

function getNodeLabel(node: Model) {
  return node.name;
}

export const renderViolations = (violations: Violation[]) =>
  violations.flatMap((v) => renderViolation(v));

const renderViolation = ({
  ruleName,
  node,
  message: description,
}: Violation) => [ruleName, getNodeLabel(node), description, ""];
