import type { RuleRegistry } from "#src/util.js";
import modelNameGrammaticalNumber from "./rules/model-name-grammatical-number.js";

export default {
  "model-name-grammatical-number": modelNameGrammaticalNumber,
} satisfies RuleRegistry;
