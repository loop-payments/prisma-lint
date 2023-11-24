import { isRegexOrRegexStr, toRegExp } from '#src/common/regex.js';

describe('isRegexOrRegexStr', () => {
  it('should return true for RegExp instance', () => {
    const regex = /[a-z]/;
    expect(isRegexOrRegexStr(regex)).toBe(true);
  });

  it('should return true for string representing a regex', () => {
    const regexStr = '/[0-9]+/';
    expect(isRegexOrRegexStr(regexStr)).toBe(true);
  });

  it('should return false for other values', () => {
    expect(isRegexOrRegexStr('test')).toBe(false);
    expect(isRegexOrRegexStr(123)).toBe(false);
    expect(isRegexOrRegexStr({})).toBe(false);
    expect(isRegexOrRegexStr(null)).toBe(false);
    expect(isRegexOrRegexStr(undefined)).toBe(false);
  });
});

describe('toRegExp', () => {
  it('should return the same RegExp instance if passed a RegExp', () => {
    const regex = /[a-z]/;
    expect(toRegExp(regex)).toBe(regex);
  });

  it('should convert a string representing a regex to a RegExp instance', () => {
    const regexStr = '/[0-9]+/';
    const expectedRegExp = new RegExp('[0-9]+');
    expect(toRegExp(regexStr)).toEqual(expectedRegExp);
  });

  it('should create a RegExp from a string', () => {
    const stringVal = 'test';
    const expectedRegExp = new RegExp('^test$');
    expect(toRegExp(stringVal)).toEqual(expectedRegExp);
  });
});
