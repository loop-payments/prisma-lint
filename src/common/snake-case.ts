export function toSnakeCase(inputString: string, compoundWords: string[] = []) {
  const stringWithCompoundWords = compoundWords.reduce((s, compoundWord) => {
    return s.replace(
      compoundWord,
      compoundWord.charAt(0).toUpperCase() + compoundWord.slice(1).toLowerCase()
    );
  }, inputString);
  return stringWithCompoundWords
    .replace(/[\W]+/g, "_")
    .replace(/([A-Z])/g, (_, group) => `_${group.toLowerCase()}`)
    .replace(/^_/, "")
    .replace(/_+/g, "_");
}
