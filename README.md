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

In a `.prisma-lint.js` file:

```js
{
  plugins: [
    "prisma-lint-loop",
  ],
  rules: {
    "singular-model-names": ["error"],
  }
}
```

## Development

### Local testing

```
> node ./dist/cli.js fixture/valid.prisma
> node ./dist/cli.js fixture/invalid.prisma
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
