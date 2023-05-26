import modelNameGrammaticalNumber from "#src/rules/model-name-grammatical-number.js";
import type { RuleRegistry } from "#src/common/rule.js";
import modelNamePrefix from "#src/rules/model-name-prefix.js";

export default {
  "model-name-grammatical-number": modelNameGrammaticalNumber,
  "model-name-prefix": modelNamePrefix,
} satisfies RuleRegistry;
