import { Enum } from "@kejistan/enum";

export const PrismaPropertyType = Enum({
  FIELD: "field",
  ATTRIBUTE: "attribute",
  COMMENT: "comment",
});

export type PrismaAttribute = { name: string; args: PrismaAttributeArg[] };
export type PrismaAttributeArg = {
  type: string;
  value: PrismaAttributeArgValue;
};
export type PrismaAttributeArgValue = { value: string; key: string };

export function getMapAttribute(attributes: PrismaAttribute[]) {
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

export function getNameAttributeArg(args: PrismaAttributeArg[]) {
  const filtered = args.filter((a) => a.value.key === "name");
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
