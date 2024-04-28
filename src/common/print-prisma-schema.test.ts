import { getPrismaSchema } from '#src/common/get-prisma-schema.js';
import { printPrismaSchema } from '#src/common/print-prisma-schema.js';

describe('print prisma schema', () => {
  it('prints a simple schema', () => {
    const schema = getPrismaSchema('model Post {\n  tags String[]\n}\n');
    const output = printPrismaSchema(schema);
    expect(output).toEqual('model Post {\n  tags String[]\n}\n');
  });

  it('prints a simple schema with comments', () => {
    const schema = getPrismaSchema(
      '// test\nmodel Post {\n  tags String[]\n}\n// test\n',
    );
    const output = printPrismaSchema(schema);
    // Note: Extra new lines are added by the printer, and
    // we cannot distinguish between intentional and unintentional new lines.
    expect(output).toEqual(
      '// test\n\nmodel Post {\n  tags String[]\n}\n// test\n',
    );
  });

  it('prints a simple schema with comments and new lines', () => {
    const schema = getPrismaSchema(
      '// test\n\nmodel Post {\n  tags String[]\n}\n\n// test\n',
    );
    const output = printPrismaSchema(schema);
    expect(output).toEqual(
      '// test\n\nmodel Post {\n  tags String[]\n}\n\n// test\n',
    );
  });
});
