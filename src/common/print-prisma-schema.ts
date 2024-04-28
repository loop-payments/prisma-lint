import { printSchema, type Schema as PrismaSchema } from '@mrleebo/prisma-ast';

export function printPrismaSchema(schema: PrismaSchema) {
  const rawOutput = printSchema(schema);
  // Delete new lines inserted above "model Foo" to avoid extra new lines.
  const output = rawOutput.replace(/\n+(?=\nmodel)/g, '');
  // Delete new lines inserted after "}" to avoid extra new lines.
  output.replace(/(?<=}\n)\n/g, '');
  return output;
}
