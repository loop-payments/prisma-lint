import modelNameGrammaticalNumber from "#src/rules/model-name-grammatical-number.js";
import type { RuleRegistry } from "#src/common/rule.js";
import modelNamePrefix from "#src/rules/model-name-prefix.js";
import modelNameMappingSnakeCase from "#src/rules/model-name-mapping-snake-case.js";

export default {
  "model-name-grammatical-number": modelNameGrammaticalNumber,
  "model-name-mapping-snake-case": modelNameMappingSnakeCase,
  "model-name-prefix": modelNamePrefix,
} satisfies RuleRegistry;
