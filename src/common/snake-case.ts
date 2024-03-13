import pluralize from 'pluralize';

/**
 * Returns a snake case string expected based on input string,
 * accounting for compound words and prefix.
 */
export function toSnakeCase(
  input: string,
  options: {
    /**
     * A prefix to require in the input string
     */
    requirePrefix?: string;

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
     * A mapping from singular form to irregular plural form,
     * for use when `pluralize` is true. Both forms should be
     * in snake case.
     * Example: `{ bill_of_lading: "bills_of_lading" }`
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
  let result = snakeCaseWithCompoundWords;

  if (options.pluralize) {
    if (options.irregularPlurals) {
      for (const [singular, plural] of Object.entries(
        options.irregularPlurals,
      )) {
        pluralize.addIrregularRule(singular, plural);
      }
    }
    result = pluralize(snakeCaseWithCompoundWords);
  }

  if (options.requirePrefix) {
    result = `${options.requirePrefix}${snakeCaseWithCompoundWords}`;
  }

  return result;
}
