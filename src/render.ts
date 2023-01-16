import { Model } from "@mrleebo/prisma-ast";
import { Violation } from "src/util";

function getNodeLabel(node: Model) {
  return node.name;
}

export const renderViolations = (violations: Violation[]) =>
  violations.flatMap((v) => [renderViolation(v), ""]);

const renderViolation = ({ ruleName, node, description }: Violation) => [
  ruleName,
  getNodeLabel(node),
  description,
];
