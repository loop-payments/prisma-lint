import { renderViolationsSimple } from '#src/output/render/render-simple.js';
import { MOCK_VIOLATIONS } from '#src/output/render/render-test-util.js';

describe('render json', () => {
  it('matches snapshot', () => {
    const result = renderViolationsSimple(MOCK_VIOLATIONS);
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
