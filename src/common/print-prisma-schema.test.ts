import { getPrismaSchema } from '#src/common/get-prisma-schema.js';
import { printPrismaSchema } from '#src/common/print-prisma-schema.js';

describe('print schema', () => {
  const sourceCode = `
model Post {
  tags String[]
}
  `;
  const expected = `
model Post {
  tags String[] @default([])
}
  `;
  it('prints schema', () => {
    const schema = getPrismaSchema(sourceCode);
    const attrs = [
      {
        type: 'attribute',
        name: 'default',
        kind: 'field',
        args: [
          {
            type: 'attributeArgument',
            value: { type: 'array', args: [] },
          },
        ],
      },
    ];
    (schema['list'][0] as any)['properties'][0]['attributes'] = attrs;
    const result = printPrismaSchema(schema);
    expect(result.trim()).toEqual(expected.trim());
  });
});
