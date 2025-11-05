# Developing `prisma-lint`

## Set up

```sh
asdf install
corepack enable
asdf reshim
yarn
```

## Build & run

```sh
yarn build && node ./dist/cli.js -c example/.prismalintrc.json example/valid.prisma
```

## Test

A few options:

1. To run all unit tests use `yarn test`.
2. To run a specific unit test use `yarn test <test>`.
3. To run a local version against example test cases, see [example/README.md](./example/README.md). Feel free to add or edit examples.
4. To use a local version of `prisma-lint` within a different repository, update the other repository's `package.json` dependency as shown below, then run `yarn` and `yarn prisma-lint` within the other repository.

```
"prisma-lint": "portal:/Users/max/loop/prisma-lint",
```

## Deprecating rules

To deprecate a rule, add a `deprecated` field to the rule definition:

```typescript
export default {
  ruleName: 'my-old-rule',
  configSchema: Config,
  create: (config, context) => {
    // rule implementation
  },
  deprecated: {
    message: 'This rule is no longer maintained.',
    replacedBy: 'my-new-rule', // optional
  },
} satisfies ModelRuleDefinition<z.infer<typeof Config>>;
```

When users configure a deprecated rule in their `.prismalintrc.json`, they will see a warning message like:

```
Warning: Rule 'my-old-rule' is deprecated. This rule is no longer maintained. Use 'my-new-rule' instead.
```

The rule will still function normally, but users are encouraged to migrate to the replacement rule.

## Review

To prepare a pull request for review:

1. Generate rules documentation (`RULES.md`) by running `yarn docs`.
2. Add an entry to the "Unreleased" section in `CHANGELOG.md`. Omit this step if there is no user-facing change.
3. Create a pull request.

## Release

To release a new version:

- Check out a new branch.
- Run `yarn bump-version`.
- Create a pull request and merge it.
- The `release.yml` GitHub Action will publish to NPM.
