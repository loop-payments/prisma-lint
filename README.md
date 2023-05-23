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

## Local testing

```
> node ./dist/cli.js fixture/valid.prisma
> node ./dist/cli.js fixture/invalid.prisma
```

## TODO

- Support for plugins with `rc-config-loader`
- Prettier CLI output
