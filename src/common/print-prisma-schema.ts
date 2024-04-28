import { printSchema, type Schema as PrismaSchema } from '@mrleebo/prisma-ast';

export function printPrismaSchema(schema: PrismaSchema) {
  const rawOutput = printSchema(schema);
  // Delete new line above "model Foo" to avoid extra new lines.
  const output = rawOutput.replace(/\n+(?=\nmodel)/g, '');
  return output;
}
