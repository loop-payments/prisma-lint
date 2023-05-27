# prisma-lint (WIP)

A work-in-progress linter for Prisma schema files.

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

## Configuration

In a `.prisma-lint.json` file:

```js
{
  "plugins": [
    "prisma-lint-loop",
  ],
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

## Development

### Local testing

```
> yarn build && node ./dist/cli.js -c fixture/.prisma-lint.json fixture/invalid.prisma
```

### TODO

Features:

- Support for configuration file
- Support for plugins
- Plugin repository template
- Support for ignore comments
- Prettier CLI output

Internal:

- GitHub Actions
- package.json sorting
