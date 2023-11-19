
import { renderViolationsContextual } from '#src/common/render/render-contextual.js';
import { renderViolationsJsonObject } from '#src/common/render/render-json.js';
import { renderViolationsSimple } from '#src/common/render/render-simple.js';
import { MOCK_SOURCE_CODE, MOCK_VIOLATIONS } from '#src/common/render/render-test-util.js';

describe('render json', () => {
  it('matches snapshot', () => {
    const result = renderViolationsSimple(MOCK_VIOLATIONS); 
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
