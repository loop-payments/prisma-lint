export const isRegexOrRegexStr = (value: any) => {
  return (
    value instanceof RegExp || (value.startsWith('/') && value.endsWith('/'))
  );
};

export const toRegExp = (value: string | RegExp) => {
  if (value instanceof RegExp) {
    return value;
  }
  if (value.startsWith('/') && value.endsWith('/')) {
    new RegExp(value.slice(1, -1));
  }
  return new RegExp(value);
};
