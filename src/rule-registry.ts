import type { RuleRegistry } from "#src/common/rule.js";
import modelNameGrammaticalNumber from "#src/rules/model-name-grammatical-number.js";
import modelNameMappingSnakeCase from "#src/rules/model-name-mapping-snake-case.js";
import modelNamePrefix from "#src/rules/model-name-prefix.js";

export default {
  "model-name-grammatical-number": modelNameGrammaticalNumber,
  "model-name-mapping-snake-case": modelNameMappingSnakeCase,
  "model-name-prefix": modelNamePrefix,
} satisfies RuleRegistry;
