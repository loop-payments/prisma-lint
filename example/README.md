# Some examples for manual testing

```
> yarn build && node ./dist/cli.js -c example/.invalidprismalintrc.json example/invalid.prisma
> yarn build && node ./dist/cli.js -c example/.prismalintrc.json example/invalid.prisma
> yarn build && node ./dist/cli.js -c example/.prismalintrc.json example/valid.prisma
```
