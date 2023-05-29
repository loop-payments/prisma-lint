
# Rules

> This document is automatically generated from the source code. Do not edit it directly.

Configuration option schemas are written with [Zod](
<https://github.com/colinhacks/zod>).

- [field-name-mapping-snake-case](#field-name-mapping-snake-case)
- [field-order](#field-order)
- [forbid-field](#forbid-field)
- [model-name-grammatical-number](#model-name-grammatical-number)
- [model-name-mapping-snake-case](#model-name-mapping-snake-case)
- [model-name-prefix](#model-name-prefix)
- [require-field-index](#require-field-index)
- [require-field-type](#require-field-type)
- [require-field](#require-field)

## field-name-mapping-snake-case

Requires that the mapped name of a field is the expected snake case.


### Configuration

```ts
z
  .object({
    compoundWords: z.array(z.string()).optional(),
  })
  .strict()
  .optional();
```

### Examples

#### Default

```prisma
// good
model UserRole {
  userId String @map(name: "user_id")
}
model UserRole {
  // No mapping needed.
  id String
}
// bad
model UserRole {
  userId String
}
model UserRole {
  userId String @map(name: "user_i_d")
}
```

#### With `{ compoundWords: ["GraphQL"] }`

```prisma
// good
model PersistedQuery {
  graphQLId String @map(name: "graphql_id")
}
// bad
model PersistedQuery {
  graphQLId String @map(name: "graph_q_l_id")
}
```

## field-order

Checks that fields within a model are in the correct order.

Fields in the `order` that are not present in the model are ignored.
To require fields, use the `require-field` rule.

The first field in the `order` is interpreted to be require as
the first field in the model. The last field in the `order` is
interpreted to be require as the last field in the model.

The special field name `...` can be used to indicate that any
number of fields can appear in the model at that point.


### Configuration

```ts
z
  .object({
    order: z.array(z.string()),
  })
  .strict();
```

### Examples

#### With `{ order: ['tenantId', 'id', createdAt', 'updatedAt', '...'] }`

```prisma
// good
model User {
  tenantId String
  id String @id
  email String
}
model User {
  tenantId String
  id String @id
  createdAt DateTime
  email String
}
// bad
model Users {
  id String @id
  email String
  tenantId String
}
```

#### With `{ order: ['tenantId', 'id', '...', 'createdAt', 'updatedAt'] }`

```prisma
// good
model User {
  tenantId String
  id String
  email String
  createdAt DateTime
  updatedAt DateTime
}
// good
model User {
  tenantId String
  id String
  email String
  createdAt DateTime
}
```

## forbid-field

Forbids fields with certain names.


### Configuration

```ts
z
  .object({
    forbid: z.array(z.union([z.string(), z.instanceof(RegExp)])),
  })
  .strict();
```

### Examples

#### With `{ forbid: ["id"] }`

```prisma
// good
type Product {
  uuid String
}
// bad
type Product {
  id String
}
```

#### With `{ forbid: ["/^(?!.*[aA]mountD6$).*D6$/"] }`

```prisma
// good
type Product {
  id String
  priceAmountD6 Int
}
// bad
type Product {
  id Int
  priceD6 Int
}
```

## model-name-grammatical-number

Checks that each model name matches the plural or singlar enforced style.

<https://en.wikipedia.org/wiki/Grammatical_number>


### Configuration

```ts
z
  .object({
    style: z.enum(['singular', 'plural']),
  })
  .strict();
```

### Examples

#### With `{ style: "singular" }`

```prisma
// good
model User {
  id String @id
}
// bad
model Users {
  id String @id
}
```

#### With `{ style: "plural" }`

```prisma
// good
model Users {
  id String @id
}
// bad
model User {
  id String @id
}
```

## model-name-mapping-snake-case

Checks that the mapped name of a model is the expected snake case.


### Configuration

```ts
z
  .object({
    compoundWords: z.array(z.string()).optional(),
    trimPrefix: z.string().optional(),
  })
  .strict()
  .optional();
```

### Examples

#### Default

```prisma
// good
model UserRole {
  id String @id
  @@map(name: "user_role")
}
// bad
model UserRole {
  id String @id
}
model UserRole {
  id String @id
  @@map(name: "user_roles")
}
```

#### With `{ trimPrefix: "Db" }`

```prisma
// good
model DbUserRole {
  id String @id
  @@map(name: "user_role")
}
// bad
model DbUserRole {
  id String @id
  @@map(name: "db_user_role")
}
```

#### With `{ compoundWords: ["GraphQL"] }`

```prisma
// good
model GraphQLPersistedQuery {
  id String @id
  @@map(name: "graphql_persisted_query")
}
// bad
model GraphQLPersistedQuery {
  id String @id
  @@map(name: "graph_q_l_persisted_query")
}
```

## model-name-prefix

Check that model names include a require prefix.

This is useful for avoiding name collisions with
application-level types in cases where a single
domain object is persisted in multiple tables,
and the application type differs from the table
structure.


### Configuration

```ts
z
  .object({
    prefix: z.string(),
  })
  .strict();
```

### Examples

#### With `{ prefix: "Db" }`

```prisma
// good
model DbUser {
  id String @id
}
// bad
model Users {
  id String @id
}
```

## require-field-index

Checks that certain fields have indices.

This rules supports selective ignoring via the `prisma-lint-ignore-model`
comment, like so:

    /// prisma-lint-ignore-model require-field-index tenantId

That will ignore only `tenantId` violations for the model. Other
require indices will still be enforced. A comma-separated list of fields
can be provided to ignore multiple fields.


### Configuration

```ts
z
  .object({
    forAllRelations: z.boolean().optional(),
    forNames: z
      .union([z.string(), z.array(z.union([z.string(), z.instanceof(RegExp)]))])
      .optional(),
  })
  .strict();
```

### Examples

#### With `{ forNames: ["createdAt"] }`

```prisma
// good
type User {
  createdAt DateTime @unique
}
type User {
  createdAt DateTime
  @@index([createdAt])
}
type User {
  createdAt DateTime
  id String
  @@index([createdAt, id])
}
// bad
type User {
  createdAt string
}
type User {
  createdAt DateTime
  id String
  @@index([id, createdAt])
}
```

#### With `{ forNames: "/Id$/" ] }`

```prisma
// good
type User {
  tenantId String
  @@index([tenantId])
}
// bad
type User {
  tenantId String
}
```

#### With `{ forAllRelations: true }`

```prisma
// good
type Bar {
  fooId String
  foo Foo @relation(fields: [fooId], references: [id])
  @@index([fooId])
}
// bad
type Bar {
  fooId String
  foo Foo @relation(fields: [fooId], references: [id])
}
```

## require-field-type

Checks that certain fields have a specific type.


### Configuration

```ts
z
  .object({
    require: z.array(
      z.object({
        ifName: z.union([z.string(), z.instanceof(RegExp)]),
        type: z.string(),
      }),
    ),
  })
  .strict();
```

### Examples

#### With `{ require: [{ ifName: "id", type: "String" }] }`

```prisma
// good
type User {
  id String
}
// bad
type User {
  id Int
}
```

#### With `{ require: [{ ifName: "/At$/", type: "DateTime" }] }`

```prisma
// good
type User {
  createdAt DateTime
  updatedAt DateTime
}
// bad
type User {
  createdAt string
  updatedAt string
}
```

## require-field

Checks that a model has certain fields.

This rules supports selective ignoring via the `prisma-lint-ignore-model`
comment, like so:

    /// prisma-lint-ignore-model require-field tenantId

That will ignore only `tenantId` field violations for the model. Other
require fields will still be enforced. A comma-separated list of fields
can be provided to ignore multiple require fields.


### Configuration

```ts
z
  .object({
    require: z.array(
      z.union([
        z.string(),
        z.object({
          name: z.string(),
          ifSibling: z.union([z.string(), z.instanceof(RegExp)]),
        }),
      ]),
    ),
  })
  .strict();
```

### Examples

#### With `{ require: ["id"] }`

```prisma
// good
model User {
  id Int @id
}
// bad
model User {
  name string
}
```

#### With `{ require: [{ name: "currencyCode", ifSibling: "/mountD6$/" }] }`

```prisma
// good
model Product {
  currencyCode string
  priceAmountD6 Int
}
// bad
model Product {
  priceAmountD6 Int
}
```

