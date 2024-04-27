import type { Attribute, Field } from '@mrleebo/prisma-ast';

import { z } from 'zod';

import type { FieldRuleDefinition } from '#src/common/rule.js';

const RULE_NAME = 'require-default-empty-arrays';

const Config = z.object({}).strict().optional();

/**
 * Requires default empty arrays for array fields.
 *
 * Motivation:
 * <https://github.com/loop-payments/prisma-lint/issues/275>
 *
 * @example
 *   // good
 *   model Post {
 *     tags String[] @default([])
 *   }
 *
 *   // bad
 *   model Post {
 *     tags String[]
 *   }
 *
 */
export default {
  ruleName: RULE_NAME,
  configSchema: Config,
  create: (_, context) => {
    return {
      Field: (model, field) => {
        if (hasViolation(field)) {
          context.report({
            model,
            field,
            message: 'Array field must default to empty array.',
            fix: () => {
              field.attributes = upsertDefaultEmptyArrayAttribute(
                field.attributes,
              );
            },
          });
        }
      },
    };
  },
} satisfies FieldRuleDefinition<z.infer<typeof Config>>;

const DEFAULT_EMPTY_ARRAY_ATTRIBUTE: Attribute = {
  type: 'attribute',
  name: 'default',
  kind: 'field',
  args: [
    {
      type: 'attributeArgument',
      value: { type: 'array', args: [] },
    },
  ],
};

function upsertDefaultEmptyArrayAttribute(
  attributes: Attribute[] = [],
): Attribute[] {
  const defaultAttributeIndex = findDefaultAttributeIndex(attributes);
  if (defaultAttributeIndex !== -1) {
    return [
      ...attributes.slice(0, defaultAttributeIndex),
      DEFAULT_EMPTY_ARRAY_ATTRIBUTE,
      ...attributes.slice(defaultAttributeIndex + 1),
    ];
  }
  return [...attributes, DEFAULT_EMPTY_ARRAY_ATTRIBUTE];
}

function hasViolation(field: Field): boolean {
  const { attributes, array } = field;
  if (!array) {
    return false;
  }
  if (!attributes) {
    return true;
  }
  const defaultAttribute = findDefaultAttribute(attributes);
  if (defaultAttribute == null || defaultAttribute.args == null) {
    return true;
  }
  const { args } = defaultAttribute;
  if (args.length === 0) {
    return true;
  }
  const [firstArg] = args;
  const firstArgValue = firstArg.value;
  if (firstArgValue == null) {
    return true;
  }
  if (typeof firstArgValue !== 'object') {
    return true;
  }
  if ((firstArgValue as any).type !== 'array') {
    return true;
  }
  if ((firstArgValue as any).args != null) {
    return true;
  }
  return false;
}

function findDefaultAttribute(attributes: Attribute[]): Attribute | undefined {
  const index = findDefaultAttributeIndex(attributes);
  if (index === -1) {
    return;
  }
  return attributes[index];
}

function findDefaultAttributeIndex(attributes: Attribute[]): number {
  const firstIndex = attributes.findIndex((a) => a.name === 'default');
  if (firstIndex === -1) {
    return -1;
  }
  const lastIndex = attributes.findLastIndex((a) => a.name === 'default');
  if (firstIndex !== lastIndex) {
    throw Error('Unexpected multiple default attributes!');
  }
  return firstIndex;
}
