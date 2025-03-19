import { defineConfig } from '#src/config/define-config.js';

describe('defineConfig', () => {
  it('should accept a valid configuration', () => {
    const config = {
      rules: {
        noNativeTextType: {
          allowNativeTextType: true,
        },
      },
    };

    expect(() => defineConfig(config)).not.toThrow();
    expect(defineConfig(config)).toEqual(config);
  });

  it('should validate rule configurations', () => {
    const invalidConfig = {
      rules: {
        noNativeTextType: {
          allowNativeTextType: 'not-a-boolean', // invalid type
        },
      },
    };

    expect(() => defineConfig(invalidConfig)).toThrow();
  });

  it('should allow empty configuration', () => {
    expect(() => defineConfig({})).not.toThrow();
  });
});
