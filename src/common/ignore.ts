import type { Enum, Model } from '@mrleebo/prisma-ast';

import { PrismaPropertyType } from '#src/common/prisma.js';

const IGNORE_MODEL = '/// prisma-lint-ignore-model';
const IGNORE_ENUM = '/// prisma-lint-ignore-enum';
const IGNORE_LINE = '/// prisma-lint-ignore-line';

export function listIgnoreModelComments(node: Model) {
  const commentFields = node.properties.filter(
    (p: any) => p.type === PrismaPropertyType.COMMENT,
  ) as any[];
  return commentFields
    .map((f) => f.text.trim())
    .filter((t) => t.startsWith(IGNORE_MODEL));
}

export function listIgnoreEnumComments(node: Enum) {
  const commentFields = node.enumerators.filter(
    (enumerator) => enumerator.type === 'comment',
  );
  return commentFields
    .map((f) => f.text.trim())
    .filter((t) => t.startsWith(IGNORE_ENUM));
}

export function isModelEntirelyIgnored(ignoreComments: string[]) {
  return ignoreComments.includes(IGNORE_MODEL);
}

export function isEnumEntirelyIgnored(ignoreComments: string[]) {
  return ignoreComments.includes(IGNORE_ENUM);
}

export function isRuleEntirelyIgnored(
  ruleName: string,
  ignoreModelComments: string[],
) {
  return (
    ignoreModelComments.includes(`${IGNORE_MODEL} ${ruleName}`) ||
    ignoreModelComments.includes(`${IGNORE_ENUM} ${ruleName}`)
  );
}

export function getRuleIgnoreParams(node: Model | Enum, ruleName: string) {
  const ignoreComments =
    node.type === 'model'
      ? listIgnoreModelComments(node)
      : listIgnoreEnumComments(node);
  const ruleIgnoreComment = ignoreComments.find((c) =>
    c.startsWith(
      `${node.type === 'model' ? IGNORE_MODEL : IGNORE_ENUM} ${ruleName} `,
    ),
  );
  if (ruleIgnoreComment == null) {
    return [];
  }
  const params = ruleIgnoreComment.split(' ').slice(-1)[0];
  return params.split(',').map((p: string) => p.trim());
}

export function isLineIgnored(
  sourceCode: string,
  lineIndex: number,
  ruleName: string,
) {
  const lines = sourceCode.split('\n');
  // Check previous lines for ignore comments
  for (let i = lineIndex - 2; i >= 0; i--) {
    const line = lines[i].trim();
    // If we hit a non-comment line (that isn't an ignore comment), stop looking
    if (!line.startsWith('///')) {
      return false;
    }

    if (line.startsWith(IGNORE_LINE)) {
      const params = line.slice(IGNORE_LINE.length).trim();
      if (params === '') {
        return true;
      }
      const ignoredRules = params.split(' ').map((r) => r.trim());
      if (ignoredRules.includes(ruleName)) {
        return true;
      }
    }
  }
  return false;
}
