import { Enum } from "@kejistan/enum";
import type {
  AttributeArgument,
  KeyValue,
  Model,
  ModelAttribute,
} from "@mrleebo/prisma-ast";

export const PrismaPropertyType = Enum({
  FIELD: "field",
  ATTRIBUTE: "attribute",
  COMMENT: "comment",
});

export function listAttributes(node: Model): ModelAttribute[] {
  const attributes = node.properties.filter(
    (p) => p.type === PrismaPropertyType.ATTRIBUTE
  ) as ModelAttribute[];
  return attributes;
}

export function findMapAttribute(
  attributes: ModelAttribute[]
): ModelAttribute | undefined {
  const filtered = attributes.filter((a) => a.name === "map");
  if (filtered.length === 0) {
    return;
  }
  if (filtered.length > 1) {
    throw Error(
      `Unexpected multiple map attributes! ${JSON.stringify(filtered)}`
    );
  }
  return filtered[0];
}

type NameAttribute = AttributeArgument & {
  value: { key: "name"; value: string };
};
export function findNameAttributeArg(
  args: AttributeArgument[]
): NameAttribute | undefined {
  const filtered = args.filter((a) => {
    if (typeof a.value !== "object") {
      return false;
    }
    if (!a.hasOwnProperty("key")) {
      return false;
    }
    const value = a.value as KeyValue;
    if (value.key !== "name") {
      return false;
    }
    if (typeof value.value !== "string") {
      return false;
    }
    return true;
  }) as NameAttribute[];
  if (filtered.length === 0) {
    return;
  }
  if (filtered.length > 1) {
    throw Error(
      `Unexpected multiple name attributes! ${JSON.stringify(filtered)}`
    );
  }
  return filtered[0];
}
