import { printSchema, type Schema as PrismaSchema } from '@mrleebo/prisma-ast';

export function printPrismaSchema(schema: PrismaSchema) {
  let output = printSchema(schema);
  // Delete new lines inserted above "model Foo" to avoid extra new lines.
  output = output.replace(/^\s+model/g, 'model');
  // Delete new lines inserted after "}" to avoid extra new lines.
  output = output.replace(/}\n\n$/g, '}\n');
  output = output.replace(/}\n\n\n+/g, '}\n\n');
  return output;
}
