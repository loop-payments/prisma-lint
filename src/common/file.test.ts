import { getTruncatedFileName } from '#src/common/file.js';

describe('get truncated file name', () => {
  it('returns truncated file name', () => {
    const result = getTruncatedFileName('src/common/file.spec.ts');
    expect(result).toBe('src/common/file.spec.ts');
  });

  it('strips the current cwd', () => {
    const cwd = process.cwd();
    const result = getTruncatedFileName(`${cwd}/src/common/file.spec.ts`);
    expect(result).toBe('src/common/file.spec.ts');
  });
});
