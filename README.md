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

The default schema path is `prisma/schema.prisma`. The schema path can also be configured in:

1. **`prisma.config.ts`** or **`.config/prisma.ts`** (Prisma 7+): The `schema` field is used if present.
2. **`package.json#prisma.schema`** (legacy): Supported for backwards compatibility.

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

To ignore specific lint rules for a single field, use `prisma-lint-ignore-field`:

```prisma
model User {
  /// prisma-lint-ignore-field field-name-camel-case
  user_name String
}
```

You can ignore all rules for a field by omitting the rule names:

```prisma
model User {
  /// prisma-lint-ignore-field
  user_name String
}
```

Multiple rules can be specified separated by spaces or commas:

```prisma
model User {
  /// prisma-lint-ignore-field field-name-camel-case field-name-mapping-snake-case
  user_name String
  
  /// prisma-lint-ignore-field field-name-camel-case,field-name-mapping-snake-case
  another_field String
}
```

## Output

There are a few output options.

### Simple (default)

```
> yarn prisma-lint -o simple
example/invalid.prisma ✖
  Users 11:1
    error Expected singular model name. model-name-grammatical-number
    error Missing required fields: "createdAt". require-field
  Users.emailAddress 13:3
    error Field name must be mapped to snake case. field-name-mapping-snake-case
example/valid.prisma ✔
```

### Contextual

```
> yarn prisma-lint -o contextual
example/invalid.prisma:11:1 Users
model Users {
^^^^^^^^^^^
  error Expected singular model name. model-name-grammatical-number
  error Missing required fields: "createdAt". require-field

example/invalid.prisma:13:3 Users.emailAddress
  emailAddress String
  ^^^^^^^^^^^^
  error Field name must be mapped to snake case. field-name-mapping-snake-case
```

### Filepath

```
> yarn prisma-lint -o filepath
example/invalid.prisma ✖
example/valid.prisma ✔
```

### None

```
> yarn prisma-lint -o none
```

No output, for when you just want to use the status code.

### JSON

```
> yarn prisma-lint -o json
```

Outputs a serialized JSON object with list of violations. Useful for editor plugins.

## Contributing

Pull requests are welcome. Please see [DEVELOPMENT.md](./DEVELOPMENT.md).
