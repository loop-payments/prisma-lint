import type { Enum, Model } from '@mrleebo/prisma-ast';

import { PrismaPropertyType } from '#src/common/prisma.js';

const IGNORE_MODEL = '/// prisma-lint-ignore-model';
const IGNORE_ENUM = '/// prisma-lint-ignore-enum';

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
