# Some examples for manual testing

```
> yarn build && node ./dist/cli.js -e example/.invalidprismalintrc.json example/invalid.prisma
> yarn build && node ./dist/cli.js -e example/.prismalintrc.json example/invalid.prisma
> yarn build && node ./dist/cli.js -e example/.prismalintrc.json example/valid.prisma
```
