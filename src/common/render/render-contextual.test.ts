import { renderViolationsContextual } from '#src/common/render/render-contextual.js';
import {
  MOCK_SOURCE_CODE,
  MOCK_VIOLATIONS,
} from '#src/common/render/render-test-util.js';

describe('render contextual', () => {
  it('matches snapshot', () => {
    const result = renderViolationsContextual(
      MOCK_SOURCE_CODE,
      MOCK_VIOLATIONS,
    );
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
