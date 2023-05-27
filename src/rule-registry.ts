import type { RuleRegistry } from '#src/common/rule.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';
import modelNameGrammaticalNumber from '#src/rules/model-name-grammatical-number.js';
import modelNameMappingSnakeCase from '#src/rules/model-name-mapping-snake-case.js';
import modelNamePrefix from '#src/rules/model-name-prefix.js';
import requiredFields from '#src/rules/required-fields.js';

export default Object.fromEntries(
  [
    fieldNameMappingSnakeCase,
    modelNameGrammaticalNumber,
    modelNameMappingSnakeCase,
    modelNamePrefix,
    requiredFields,
  ].map((rule) => {
    return [rule.ruleName, rule];
  }),
) satisfies RuleRegistry;
