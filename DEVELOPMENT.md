# Developing `prisma-lint`

## Set up

```sh
corepack enable
yarn
```

## Build & run

```sh
yarn build && node ./dist/cli.js -c example/.prismalintrc.json example/valid.prisma
```

## Test

Three options:

1. To run unit tests use `yarn test`.
2. To run a local version against example test cases, see [example/README.md](./example/README.md). Feel free to add or edit examples.
3. To use a local version of `prisma-lint` within a different repository, update the other repository's `package.json` dependency as shown below, then run `yarn prisma-lint` within the other repository.

```
"prisma-lint": "portal:/Users/max/loop/prisma-lint",
```

## Review

To prepare a pull request for review:

1. Generate rules documentation (`RULES.md`) by running `yarn docs`.
2. Add an entry to the "Unreleased" section in `CHANGELOG.md`. Omit this step if there is no user-facing change.
3. Create a pull request.

## Release

To release a new version:

- Check out a new branch
- Run `yarn bump-version`
- Create a pull request
- Merge it
- The `release.yml` GitHub Action will publish to NPM
