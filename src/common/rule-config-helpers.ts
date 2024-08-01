/**
 * Zod schema to be used for allowList config option
 */
// export const configAllowList = z
//   .array(z.union([z.string(), z.instanceof(RegExp)]))
//   .optional();

/**
 * Zod schema to be used for trimPrefix config option
 */
// export const configTrimPrefix = z
//   .union([
//     z.string(),
//     z.instanceof(RegExp),
//     z.array(z.union([z.string(), z.instanceof(RegExp)])),
//   ])
//   .optional();

export function matchesAllowList(
  value: string,
  allowList: (string | RegExp)[] | undefined,
) {
  return allowList?.some((entry) => {
    if (entry instanceof RegExp) {
      return entry.test(value);
    }
    return value === entry;
  });
}

export function trimPrefix(
  value: string,
  trimPrefixConfig: string | RegExp | (string | RegExp)[] | undefined,
) {
  for (const prefix of Array.isArray(trimPrefixConfig)
    ? trimPrefixConfig
    : [trimPrefixConfig]) {
    if (prefix === undefined) {
      continue;
    }
    if (prefix instanceof RegExp) {
      if (value.match(prefix)) {
        return value.replace(prefix, '');
      }
      continue;
    }
    if (value.startsWith(prefix)) {
      return value.slice(prefix.length);
    }
  }
  return value;
}
