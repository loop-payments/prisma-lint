import { renderViolationsJsonObject } from '#src/common/render/render-json.js';
import { MOCK_VIOLATIONS } from '#src/common/render/render-test-util.js';

describe('render json', () => {
  it('matches snapshot', () => {
    const result = renderViolationsJsonObject(MOCK_VIOLATIONS);
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
