# prisma-lint

A linter for Prisma schema files.

## Installation

```sh
> npm install --save-dev prisma-lint
# or
> yarn add --dev prisma-lint
```

## Configuration

See [RULES.md](RULES.md) for a list of supported rules.

Configuration files are loaded with [comsiconfig](https://github.com/cosmiconfig/cosmiconfig).

### Example

In a `.prismalintrc.json`:

```json
{
  "rules": {
    "model-name-grammatical-number": [
      "error",
      {
        "enforcedStyle": "singular"
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

## Usage

```sh
> npm prisma-lint path/to/schema.prisma
# or
> yarn prisma-lint path/to/schema.prisma
```

The arguments can be globs, directories, or file paths. The default path is `prisma/schema.prisma`.

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
  /// prisma-lint-ignore-model required-field
  /// prisma-lint-ignore-model required-field-type
}
```

Some rules support parameterized ignore comments like this:

```prisma
model User {
  /// prisma-lint-ignore-model required-field revisionNumber,revisionCreatedAt
}
```

Omitting `revisionNumber` and `revisionCreatedAt` fields from this model will not result in a violation. Other required fields remain required.
