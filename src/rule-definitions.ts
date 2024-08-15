import type { RuleDefinition } from '#src/common/rule.js';
import banUnboundedStringType from '#src/rules/ban-unbounded-string-type.js';
import fieldNameCamelCase from '#src/rules/field-name-camel-case.js';
import fieldNameMappingSnakeCase from '#src/rules/field-name-mapping-snake-case.js';
import fieldOrder from '#src/rules/field-order.js';
import forbidField from '#src/rules/forbid-field.js';
import forbidRequiredIgnoredField from '#src/rules/forbid-required-ignored-field.js';
import modelNameGrammaticalNumber from '#src/rules/model-name-grammatical-number.js';
import modelNameMappingSnakeCase from '#src/rules/model-name-mapping-snake-case.js';
import modelNamePascalCase from '#src/rules/model-name-pascal-case.js';
import modelNamePrefix from '#src/rules/model-name-prefix.js';
import requireDefaultEmptyArrays from '#src/rules/require-default-empty-arrays.js';
import requireFieldIndex from '#src/rules/require-field-index.js';
import requireFieldType from '#src/rules/require-field-type.js';
import requireField from '#src/rules/require-field.js';

export default [
  banUnboundedStringType,
  fieldNameCamelCase,
  fieldNameMappingSnakeCase,
  fieldOrder,
  forbidField,
  forbidRequiredIgnoredField,
  modelNameGrammaticalNumber,
  modelNameMappingSnakeCase,
  modelNamePascalCase,
  modelNamePrefix,
  requireDefaultEmptyArrays,
  requireField,
  requireFieldIndex,
  requireFieldType,
] satisfies RuleDefinition[];
