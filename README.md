# prisma-lint

A linter for Prisma schema files.

## Installation

```sh
> npm install --save-dev prisma-lint
# or
> yarn add --dev prisma-lint
```

## Usage

```sh
> npx prisma-lint
# or
> yarn prisma-lint
```

The default schema path is `prisma/schema.prisma`. If a custom schema path is specified in the field `prisma.schema` within `package.json`, that is used instead.

Alternatively, you can provide one or more explicit paths as CLI arguments. These can be globs, directories, or file paths. 

Run `yarn prisma-lint --help` for all options.

## Rules

The file [RULES.md](./RULES.md) contains documentation for each rule. All rules are disabled by default. Create a configuration file to enable the rules you'd like to enforce.

## Configuration

The configuration file format is loosely based on [eslint's conventions](https://github.com/eslint/eslint#configuration). Here's an example `.prismalintrc.json`:

```json
{
  "rules": {
    "field-name-mapping-snake-case": [
      "error",
      {
        "compoundWords": ["S3"]
      }
    ],
    "field-order": [
      "error",
      {
        "order": ["tenantId", "..."]
      }
    ],
    "forbid-required-ignored-field": ["error"],
    "model-name-grammatical-number": [
      "error",
      {
        "style": "singular"
      }
    ],
    "model-name-mapping-snake-case": [
      "error",
      {
        "compoundWords": ["GraphQL"]
      }
    ],
    "require-field-index": [
      "error",
      {
        "forAllRelations": true,
        "forNames": ["tenantId"]
      }
    ]
  }
}
```

See [Loop's configuration](./example/loop/.prismalintrc.json) for a more thorough example. Configuration files are loaded with [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig).

## Ignore comments

Rules can be ignored with three-slash (`///`) comments inside models.

To ignore all lint rules for a model and its fields:

```prisma
model User {
  /// prisma-lint-ignore-model
}
```

To ignore specific lint rules for a model and its fields:

```prisma
model User {
  /// prisma-lint-ignore-model require-field
  /// prisma-lint-ignore-model require-field-type
}
```

Some rules support parameterized ignore comments like this:

```prisma
model User {
  /// prisma-lint-ignore-model require-field revisionNumber,revisionCreatedAt
}
```

Omitting `revisionNumber` and `revisionCreatedAt` fields from this model will not result in a violation. Other required fields remain required.

## Contributing

Pull requests are welcome. Please see [DEVELOPMENT.md](./DEVELOPMENT.md).
