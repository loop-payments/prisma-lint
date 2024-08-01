import type { RuleDefinition } from '#src/common/rule.js';
import enumNamePascalCase from '#src/rules/enum-name-pascal-case.js';
import enumValueSnakeCase from '#src/rules/enum-value-snake-case.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';
import fieldOrder from '#src/rules/field-order.js';
import forbidField from '#src/rules/forbid-field.js';
import forbidRequiredIgnoredField from '#src/rules/forbid-required-ignored-field.js';
import modelNameGrammaticalNumber from '#src/rules/model-name-grammatical-number.js';
import modelNameMappingSnakeCase from '#src/rules/model-name-mapping-snake-case.js';
import modelNamePrefix from '#src/rules/model-name-prefix.js';
import requireDefaultEmptyArrays from '#src/rules/require-default-empty-arrays.js';
import requireFieldIndex from '#src/rules/require-field-index.js';
import requireFieldType from '#src/rules/require-field-type.js';
import requireField from '#src/rules/require-field.js';

export default [
  enumNamePascalCase,
  enumValueSnakeCase,
  fieldNameMappingSnakeCase,
  fieldOrder,
  forbidField,
  forbidRequiredIgnoredField,
  modelNameGrammaticalNumber,
  modelNameMappingSnakeCase,
  modelNamePrefix,
  requireDefaultEmptyArrays,
  requireField,
  requireFieldIndex,
  requireFieldType,
] satisfies RuleDefinition[];
