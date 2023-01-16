import type { Model } from "@mrleebo/prisma-ast";
import type { Violation } from "./util.js";

function getNodeLabel(node: Model) {
  return node.name;
}

export const renderViolations = (violations: Violation[]) =>
  violations.flatMap((v) => renderViolation(v));

const renderViolation = ({ ruleName, node, description }: Violation) => [
  ruleName,
  getNodeLabel(node),
  description,
  "",
];
