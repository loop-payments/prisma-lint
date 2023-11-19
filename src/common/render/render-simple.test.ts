import { renderViolationsSimple } from '#src/common/render/render-simple.js';
import { MOCK_VIOLATIONS } from '#src/common/render/render-test-util.js';

describe('render json', () => {
  it('matches snapshot', () => {
    const result = renderViolationsSimple(MOCK_VIOLATIONS);
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
