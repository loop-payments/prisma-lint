import { printSchema, type Schema as PrismaSchema } from '@mrleebo/prisma-ast';

export function printPrismaSchema(schema: PrismaSchema) {
  return printSchema(schema);
}
