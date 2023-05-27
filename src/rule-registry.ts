import type { RuleRegistry } from '#src/common/rule.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';
import modelNameGrammaticalNumber from '#src/rules/model-name-grammatical-number.js';
import modelNameMappingSnakeCase from '#src/rules/model-name-mapping-snake-case.js';
import modelNamePrefix from '#src/rules/model-name-prefix.js';
import requiredFieldType from '#src/rules/required-field-type.js';
import requiredField from '#src/rules/required-field.js';

export default Object.fromEntries(
  [
    fieldNameMappingSnakeCase,
    modelNameGrammaticalNumber,
    modelNameMappingSnakeCase,
    modelNamePrefix,
    requiredField,
    requiredFieldType,
  ].map((rule) => {
    return [rule.ruleName, rule];
  }),
) satisfies RuleRegistry;
