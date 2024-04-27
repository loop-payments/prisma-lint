import { getPrismaSchema } from '#src/common/get-prisma-schema.js';
import { printPrismaSchema } from '#src/common/print-prisma-schema.js';

describe('print schema', () => {
  const sourceCode = `
model User {
  name String
}
  `;
  it('prints schema', () => {
    const schema = getPrismaSchema(sourceCode);
    const result = printPrismaSchema(schema);
    expect(result.trim()).toEqual(sourceCode.trim());
  });
});
