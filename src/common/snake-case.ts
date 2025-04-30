import pluralize from 'pluralize';

/**
 * Returns a snake case string expected based on input string,
 * accounting for compound words and prefix.
 */
export function toSnakeCase(
  input: string,
  options: {
    /**
     * The case to convert to.
     * Default: 'lower'
     */
    case?: 'lower' | 'upper';

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

  // Handle prefix
  let processedInput = input.startsWith(trimPrefix)
    ? input.slice(trimPrefix.length)
    : input;

  // Convert existing snake case to lowercase
  if (isUpperSnakeCase(processedInput)) {
    processedInput = processedInput.toLowerCase();
  }

  // Create a map of positions where compound words are found
  const compoundPositions: Array<{ start: number; end: number; word: string }> =
    [];
  compoundWords.forEach((word) => {
    const regex = new RegExp(word, 'g');
    let match;
    while ((match = regex.exec(processedInput)) !== null) {
      compoundPositions.push({
        start: match.index,
        end: match.index + word.length,
        word: word.toLowerCase(),
      });
    }
  });

  // Convert to snake case, but protect compound words
  let result = '';
  for (let i = 0; i < processedInput.length; i++) {
    const compoundWord = compoundPositions.find(
      (p) => i >= p.start && i < p.end,
    );
    if (compoundWord) {
      if (i === compoundWord.start) {
        // Add underscore before compound word if needed
        if (i > 0 && result[result.length - 1] !== '_') {
          result += '_';
        }
        result += compoundWord.word;
      }
      // Skip the rest of the compound word
      i = compoundWord.end - 1;
      continue;
    }

    const char = processedInput[i];
    if (i > 0) {
      const prevChar = processedInput[i - 1];
      if (/[A-Z]/.test(char)) {
        // Add underscore before capitals
        result += `_${char.toLowerCase()}`;
      } else if (
        (/[a-zA-Z]/.test(prevChar) && /\d/.test(char)) ||
        (/\d/.test(prevChar) && /[a-zA-Z]/.test(char))
      ) {
        // Add underscore between letter and number
        result += `_${char.toLowerCase()}`;
      } else {
        result += char.toLowerCase();
      }
    } else {
      result += char.toLowerCase();
    }
  }

  // Clean up underscores
  result = result
    .replace(/[^\w]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/_+/g, '_');

  if (options.pluralize) {
    if (options.irregularPlurals) {
      for (const [singular, plural] of Object.entries(
        options.irregularPlurals,
      )) {
        pluralize.addIrregularRule(singular, plural);
      }
    }
    result = pluralize(result);
  }

  if (options.case === 'upper') {
    result = result.toUpperCase();
  }

  if (options.requirePrefix) {
    result = `${options.requirePrefix}${result}`;
  }

  return result;
}

function isUpperSnakeCase(input: string): boolean {
  return /^[A-Z0-9_]+$/.test(input);
}
