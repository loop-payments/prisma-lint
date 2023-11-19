import type { Model } from '@mrleebo/prisma-ast';

import { renderViolationsContextual } from '#src/common/render/render-contextual.js';
import type { Violation } from '#src/common/violation.js';

describe('render-contextual', () => {
  const sourceCode = `model Foo {
  id     Int    @id
  displayName String
}`;

  const model: Model = {
    type: 'model',
    name: 'Foo',
    properties: [],
    location: {
      startLine: 1,
      startColumn: 1,
      startOffset: 1,
      endLine: 1,
      endColumn: 9,
      endOffset: 1,
    }
  };
  const fileName = 'test.prisma';
  const violations: Violation[] = [
    {
      ruleName: 'fake-model-rule-name',
      message: 'Fake model rule violation message',
      fileName,
      model
    },
    {
      ruleName: 'fake-field-rule-name',
      message: 'Fake field rule violation message',
      fileName,
      model,
      field: {
        type: 'field',
        name: 'displayName',
        fieldType: 'String',
        location: {
          startLine: 2,
          startColumn: 3,
          startOffset: 1,
          endLine: 2,
          endColumn: 12,
          endOffset: 1,
        }
      }
    },
  ];

  it('should render model and field violations', () => {
    const result = renderViolationsContextual(sourceCode, violations);
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot(
      'should render violations contextual'
    );
  });
});
