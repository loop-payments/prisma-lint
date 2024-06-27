import {
  PrismaParser,
  VisitorClassFactory,
  getSchema,
  type Schema,
} from '@mrleebo/prisma-ast';

export type PrismaSchema = Schema;

export function getPrismaSchema(sourceCode: string) {
  const parser = new PrismaParser({ nodeLocationTracking: 'full' });
  const VisitorClass = VisitorClassFactory(parser);
  const visitor = new VisitorClass();
  const prismaSchema = getSchema(sourceCode, { parser, visitor });
  return prismaSchema;
}
