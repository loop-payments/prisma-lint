import pluralize from 'pluralize';

/**
 * Returns a snake case string expected based on input string,
 * accounting for compound words and prefix.
 */
export function toSnakeCase(
  input: string,
  options: {
    /**
     * A prefix to remove from the input string
     * before converting to snake case.
     */
    trimPrefix?: string;

    /**
     * A list of words to keep as a single word
     * when converting to snake case. For example,
     * "GraphQL" will be converted to "graph_ql" by default,
     * but if "GraphQL" is in this list, it will be converted
     * to "graphql".
     */
    compoundWords?: string[];

    /**
     * Whether to convert to singular or plural snake case.
     */
    pluralize?: boolean;

    /**
     * A set of irregular plurals to use when converting
     * to plural snake case. Both the singular and plural
     * forms should already be in snake case.
     */
    irregularPlurals?: Record<string, string>;
  } = {},
): string {
  const { trimPrefix = '', compoundWords = [] } = options;
  const inputWithoutPrefix = input.startsWith(trimPrefix)
    ? input.slice(trimPrefix.length)
    : input;
  const compountWordsAsSnakeCase = compoundWords.map((compoundWord) =>
    toSnakeCase(compoundWord),
  );
  const snakeCase = inputWithoutPrefix
    .replace(/[\W]+/g, '_')
    .replace(/([A-Z])/g, (_, group) => `_${group.toLowerCase()}`)
    .replace(/\d+/g, '_$&')
    .replace(/^_/, '')
    .replace(/_+/g, '_');
  const snakeCaseWithCompoundWords = compountWordsAsSnakeCase.reduce(
    (acc, compoundWord) =>
      acc.replace(compoundWord, compoundWord.replace(/_/g, '')),
    snakeCase,
  );
  if (options.pluralize) {
    if (options.irregularPlurals) {
      for (const [singular, plural] of Object.entries(
        options.irregularPlurals,
      )) {
        pluralize.addIrregularRule(singular, plural);
      }
    }
    return pluralize(snakeCaseWithCompoundWords);
  }
  return snakeCaseWithCompoundWords;
}
