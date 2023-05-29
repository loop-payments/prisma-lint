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
> npm prisma-lint path/to/schema.prisma
# or
> yarn prisma-lint path/to/schema.prisma
```

The arguments can be globs, directories, or file paths. The default path is `prisma/schema.prisma`.

## Configuration

Configuration files are loaded with [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig).
Here's an example `.prismalintrc.json`:

```json
{
  "rules": {
    "model-name-grammatical-number": [
      "error",
      {
        "style": "singular"
      }
    ],
    "model-name-mapping-snake-case": [
      "error",
      {
        "compoundWords": ["GraphQL"],
        "trimPrefix": "Db"
      }
    ],
    "model-name-prefix": [
      "error",
      {
        "prefix": "Db"
      }
    ]
  }
}
```

### Rules

See [RULES.md](RULES.md) for a full list of supported rules.

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
