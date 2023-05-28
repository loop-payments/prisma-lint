import { Enum } from '@kejistan/enum';
import type {
  AttributeArgument,
  Field,
  KeyValue,
  Model,
  ModelAttribute,
  Schema,
  Value,
} from '@mrleebo/prisma-ast';

export function listFields(model: Model): Field[] {
  return model.properties.filter(
    (property) => property.type === 'field',
  ) as Field[];
}
export const PRISMA_SCALAR_TYPES = new Set<string>([
  'String',
  'Boolean',
  'Int',
  'BigInt',
  'Float',
  'Decimal',
  'DateTime',
  'Json',
  'Bytes',
]);

export const PrismaPropertyType = Enum({
  FIELD: 'field',
  ATTRIBUTE: 'attribute',
  COMMENT: 'comment',
});

export function listModelBlocks(schema: Schema) {
  return schema.list.filter((block): block is Model => block.type === 'model');
}

export function listAttributes(node: Model): ModelAttribute[] {
  const attributes = node.properties.filter(
    (p) => p.type === PrismaPropertyType.ATTRIBUTE,
  ) as ModelAttribute[];
  return attributes;
}

type NameAttribute = AttributeArgument & {
  value: { key: 'name'; value: string };
};
export function findNameAttributeArg(
  args: AttributeArgument[],
): NameAttribute | undefined {
  const filtered = args.filter((a) => {
    if (typeof a.value !== 'object') {
      return false;
    }
    if (!a.value.hasOwnProperty('key')) {
      return false;
    }
    const value = a.value as KeyValue;
    if (value.key !== 'name') {
      return false;
    }
    if (typeof value.value !== 'string') {
      return false;
    }
    return true;
  }) as NameAttribute[];
  if (filtered.length === 0) {
    return;
  }
  if (filtered.length > 1) {
    throw Error(
      `Unexpected multiple name attributes! ${JSON.stringify(filtered)}`,
    );
  }
  return filtered[0];
}

export function isValue(value: Value | KeyValue): value is Value {
  return !isKeyValue(value);
}

export function isKeyValue(value: Value | KeyValue): value is KeyValue {
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.type === 'keyValue'
  ) {
    return true;
  }

  return false;
}

export function assertValueIsStringArray(value: Value): Array<string> {
  if (Array.isArray(value)) {
    return value as Array<string>;
  }

  if (typeof value === 'object') {
    if (value.type === 'array') {
      return value.args;
    }
  }

  throw new Error(`value is not a string array ${JSON.stringify(value)}`);
}
