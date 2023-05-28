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

## Rules

See [RULES.md](RULES.md). By default, no rules are enabled.

## Configuration

In a `.prisma-lint.json` file, something like:

```js
{
  "rules": {
    "model-name-grammatical-number": ["error", {
      "enforcedStyle": "singular"
    }],
    "model-name-mapping-snake-case": ["error", {
      "compoundWords": ["GraphQL"],
      "trimPrefix": "Db"
    }],
    "model-name-prefix": ["error", {
      "prefix": "Db"
    }]
  }
}
```
