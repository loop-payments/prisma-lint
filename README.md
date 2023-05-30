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
> npx prisma-lint path/to/schema.prisma
# or
> yarn prisma-lint path/to/schema.prisma
```

The arguments can be globs, directories, or file paths. The default path is `prisma/schema.prisma`.

Run `yarn prisma-lint --help` for all options.

## Rules

The file [RULES.md](./RULES.md) contains documentation for each rule. All rules are disabled by default. Create a configuration file to enable the rules you'd like to enforce.

## Configuration

The configuration file format is loosely based on [eslint's conventions](https://github.com/eslint/eslint#configuration). Here's an example `.prismalintrc.json`:

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
