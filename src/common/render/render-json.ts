
import { keyViolationListPairs } from '#src/common/render/render-util.js';
import type { Violation } from '#src/common/violation.js';

export const renderViolationsJson = (violations: Violation[]) => {
  const jsonObject = renderViolationsJsonObject(violations);
  return JSON.stringify(jsonObject);
};

export const renderViolationsJsonObject = (
  violations: Violation[],
): Record<string, any>[] => {
  const pairs = keyViolationListPairs(violations);
  return pairs.flatMap(([_, violations]) => {
    const first = violations[0];
    const { fileName } = first;
    const rawLocation = first.field?.location ?? first.model.location;
    if (!rawLocation) {
      throw new Error('No location');
    }
    const {
      startLine,
      startColumn,
      startOffset,
      endLine,
      endColumn,
      endOffset,
    } = rawLocation;
    const location = {
      startLine,
      startColumn,
      startOffset,
      endLine,
      endColumn,
      endOffset,
    };
    return violations.map((v) => ({
      ruleName: v.ruleName,
      message: v.message,
      fileName,
      location,
    }));
  });
};
