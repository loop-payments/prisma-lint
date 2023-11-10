# Developing `prisma-lint`

## Set up

```sh
corepack enable
yarn
```

## Test

```sh
yarn test
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
- The `release.yml` GitHub Action will publish to NPM.
