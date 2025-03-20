import pluralize from 'pluralize';

export interface toSnakeCaseOptions {
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

  /**
   * Whether or not each segment of the snake_case term should be upper case.
   * Example: SCREAMING_SNAKE_CASE (as opposed to screaming_snake_case)
   */
  screaming?: boolean;
}

/**
 * Returns a snake case string expected based on input string,
 * accounting for compound words and prefix.
 */
export function toSnakeCase(
  input: string,
  options: toSnakeCaseOptions = {},
): string {
  const { trimPrefix = '', compoundWords = [], screaming } = options;
  const inputWithoutPrefix = input.startsWith(trimPrefix)
    ? input.slice(trimPrefix.length)
    : input;
  const compoundWordsAsSnakeCase = [
    ...new Set(compoundWords.map((compoundWord) => toSnakeCase(compoundWord))),
  ];
  const snakeCase = inputWithoutPrefix
    .replace(/[\W]+/g, '_')
    // split on percieved word boundaries: aWord
    .replace(
      /([^A-Z][A-Z])/g,
      (_, lowerUpper: string) => `${lowerUpper[0]}_${lowerUpper[1]}`,
    )
    // split after detecting the start of a new word AAAAWord
    .replace(
      /([A-Z][a-z])/g,
      (_, wordStart: string) => `_${wordStart.toLowerCase()}`,
    )
    .replace(/\d+/g, '_$&_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/_+/g, '_')
    .toLowerCase();
  const snakeCaseWithCompoundWords = compoundWordsAsSnakeCase.reduce(
    (acc, compoundWord) =>
      acc.replace(compoundWord, compoundWord.replaceAll('_', '')),
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
  if (screaming) {
    result = result.toUpperCase();
  }
  if (options.requirePrefix) {
    result = `${options.requirePrefix}${result}`;
  }
  return result;
}
