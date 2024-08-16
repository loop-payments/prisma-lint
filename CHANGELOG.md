# Changelog

## Unreleased

- Add new rules `enum-name-pascal-case` and `enum-value-snake-case`.
- Add new rule `ban-unbounded-string-type`.
- Add new rules `model-name-pascal-case` and `field-name-camel-case`.

## 0.5.0 (2024-05-01)

- [#388](https://github.com/loop-payments/prisma-lint/issues/388) Teach `field-name-mapping-snake-case` ignore comments about individual fields.

## 0.4.0 (2024-04-23)

- [#363](https://github.com/loop-payments/prisma-lint/issues/363) Require enum and custom type fields to use snake case in `field-name-mapping-snake-case`.

## 0.3.0 (2024-04-03)

- [#330](https://github.com/loop-payments/prisma-lint/issues/330) Remove `requirePrefix` option and add `requireUnderscorePrefixForIds` to `field-name-mapping-snake-case` to actually support MongoDB naming conventions.

## 0.2.0 (2024-03-29)

- [#354](https://github.com/loop-payments/prisma-lint/issues/354) Add `allowlist` to `model-name-grammatical-number`.

## 0.1.3 (2024-03-23)

- Upgrade `@mrleebo/prisma-ast` to get new version that supports mapped enums.

## 0.1.2 (2024-03-13)

- Add `require-prefix` option to `field-name-mapping-snake-case` to support MongoDB naming conventions.

## 0.1.1 (2024-03-09)

- Upgrade dependencies.

## 0.1.0 (2024-01-06)

- [#275](https://github.com/loop-payments/prisma-lint/issues/275) Add new rule `require-default-empty-arrays`.

## 0.0.26 (2023-12-30)

- Show violation for incorrect mapping of single-word field name.

## 0.0.25 (2023-11-25)

- Avoid empty line in `simple` output format.

## 0.0.24 (2023-11-24)

- Add new `-o, --output` option which accepts `simple` (the default), `none`, `contextual`, `filepath`, and `json`.

## 0.0.23 (2023-11-15)

- Allow ignoring required fields with default values in `forbid-required-ignored-field`.

## 0.0.22 (2023-11-10)

- Add option to pluralize snake case model names.

## 0.0.20 (2023-08-22)

- Add support for reading prisma schema configuration from `package.json`.

## 0.0.19 (2023-08-04)

- Add rule to forbid required ignored fields, which have [surprising side effects](https://github.com/prisma/prisma/issues/13467).

## 0.0.18 (2023-06-06)

- [#59](https://github.com/loop-payments/prisma-lint/issues/59) Add support for `@map` and `@@map` without keys.
- [#56](https://github.com/loop-payments/prisma-lint/issues/56) Clearer error message when configuration not found.

## 0.0.17 (2023-06-01)

- Show clearer error if "rules" is missing from config.
- Allow ignore parameters for the `forbid-field` rule.

## 0.0.16 (2023-05-31)

- Minor tweaks to rules documentation.

## 0.0.15 (2023-05-30)

- Add Loop example configuration.
- Add comment to README about rules being disabled by default.
- Improve error output for invalid and missing configuration files.

## 0.0.12 (2023-05-30)

- Fix behavior when no CLI arg is provided.

## 0.0.11 (2023-05-30)

- Add support for terminal colors and `--no-color` CLI option.

## 0.0.10 (2023-05-30)

- Support automatic releases on version changes.

## 0.0.4 (2023-05-30)

- Add CHANGELOG.

## 0.0.3 (2023-05-29)

- Add full implementation of first version.

## 0.0.2 (2023-05-23)

- Fix release contents.

## 0.0.1 (2023-05-23)

- Add initial skeleton code.
