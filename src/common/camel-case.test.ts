import { toCamelCase } from '#src/common/camel-case.js';

describe('toCamelCase', () => {
  describe('various input cases', () => {
    it('converts single-word string to camel case', () => {
      const input = 'hello';
      const result = toCamelCase(input);
      expect(result).toEqual('hello');
    });

    it('converts Pascal case string to camel case', () => {
      const input = 'PascalCaseString';
      const result = toCamelCase(input);
      expect(result).toEqual('pascalCaseString');
    });

    it('converts kebab case string to camel case', () => {
      const input = 'kebab-case-string';
      const result = toCamelCase(input);
      expect(result).toEqual('kebabCaseString');
    });

    it('converts upper kebab case string to camel case', () => {
      const input = 'KEBAB-CASE-STRING';
      const result = toCamelCase(input);
      expect(result).toEqual('kebabCaseString');
    });

    it('converts snake case string to camel case', () => {
      const input = 'snake_case_string';
      const result = toCamelCase(input);
      expect(result).toEqual('snakeCaseString');
    });

    it('converts upper snake case string to camel case', () => {
      const input = 'SNAKE_CASE_STRING';
      const result = toCamelCase(input);
      expect(result).toEqual('snakeCaseString');
    });
  });

  describe('compound words', () => {
    it('respects compound words', () => {
      const input = 'helloWorldGraphQL';
      const result = toCamelCase(input, {
        compoundWords: ['GraphQL'],
      });
      expect(result).toEqual('helloWorldGraphQL');
    });

    it('respects compound words with many two-word compound words', () => {
      const input = 'GameBRTicketLostSequence';
      const result = toCamelCase(input, {
        compoundWords: ['Q6', 'QU', 'QX', 'BR', 'LT', 'QP', 'L5', 'TK', 'QT'],
      });
      expect(result).toEqual('gameBRTicketLostSequence');
    });

    it('respects multiple compound words', () => {
      const input = 'APIHelloWorldGraphQL';
      const result = toCamelCase(input, {
        compoundWords: ['API', 'GraphQL'],
      });
      expect(result).toEqual('APIHelloWorldGraphQL');
    });
  });

  describe('require prefix', () => {
    it('respects required prefix', () => {
      const input = 'FooBar';
      const result = toCamelCase(input, {
        requirePrefix: '_',
      });
      expect(result).toEqual('_fooBar');
    });
  });

  describe('numbers', () => {
    it('makes numbers their own words', () => {
      const input = 'Word1234Word';
      const result = toCamelCase(input);
      expect(result).toEqual('word1234Word');
    });
    it('handles complex cases', () => {
      const input = 'a0a0aa0';
      const result = toCamelCase(input);
      expect(result).toEqual('a0A0Aa0');
    });
  });

  describe('non-alphabetic', () => {
    it('handles non-alphanumeric characters', () => {
      const input = 'This@Is_A^Test';
      const result = toCamelCase(input);
      expect(result).toEqual('thisIsATest');
    });

    it('handles multiple non-alphanumeric characters', () => {
      const input = 'This@@Is__A^^Test';
      const result = toCamelCase(input);
      expect(result).toEqual('thisIsATest');
    });
  });

  describe('without prefix', () => {
    it('removes prefix', () => {
      const input = 'PrefixWord';
      const result = toCamelCase(input, { trimPrefix: 'Prefix' });
      expect(result).toEqual('word');
    });

    it('does not remove prefix if it does not match', () => {
      const input = 'SomethingElsePrefixWord';
      const result = toCamelCase(input, { trimPrefix: 'Pre' });
      expect(result).toEqual('somethingElsePrefixWord');
    });
  });
});
