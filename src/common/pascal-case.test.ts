import { toPascalCase } from '#src/common/pascal-case.js';

describe('toPascalCase', () => {
  describe('various input cases', () => {
    it('converts single-word string to pascal case', () => {
      const input = 'hello';
      const result = toPascalCase(input);
      expect(result).toEqual('Hello');
    });

    it('converts Pascal case string to pascal case', () => {
      const input = 'PascalCaseString';
      const result = toPascalCase(input);
      expect(result).toEqual('PascalCaseString');
    });

    it('converts kebab case string to pascal case', () => {
      const input = 'kebab-case-string';
      const result = toPascalCase(input);
      expect(result).toEqual('KebabCaseString');
    });

    it('converts upper kebab case string to pascal case', () => {
      const input = 'KEBAB-CASE-STRING';
      const result = toPascalCase(input);
      expect(result).toEqual('KebabCaseString');
    });

    it('converts snake case string to pascal case', () => {
      const input = 'snake_case_string';
      const result = toPascalCase(input);
      expect(result).toEqual('SnakeCaseString');
    });

    it('converts upper snake case string to pascal case', () => {
      const input = 'SNAKE_CASE_STRING';
      const result = toPascalCase(input);
      expect(result).toEqual('SnakeCaseString');
    });
  });

  describe('compound words', () => {
    it('respects compound words', () => {
      const input = 'helloWorldGraphQL';
      const result = toPascalCase(input, {
        compoundWords: ['GraphQL'],
      });
      expect(result).toEqual('HelloWorldGraphQL');
    });

    it('respects compound words with many two-word compound words', () => {
      const input = 'GameBRTicketLostSequence';
      const result = toPascalCase(input, {
        compoundWords: ['Q6', 'QU', 'QX', 'BR', 'LT', 'QP', 'L5', 'TK', 'QT'],
      });
      expect(result).toEqual('GameBRTicketLostSequence');
    });

    it('respects multiple compound words', () => {
      const input = 'APIHelloWorldGraphQL';
      const result = toPascalCase(input, {
        compoundWords: ['API', 'GraphQL'],
      });
      expect(result).toEqual('APIHelloWorldGraphQL');
    });
  });

  describe('require prefix', () => {
    it('respects required prefix', () => {
      const input = 'FooBar';
      const result = toPascalCase(input, {
        requirePrefix: '_',
      });
      expect(result).toEqual('_FooBar');
    });
  });

  describe('numbers', () => {
    it('makes numbers their own words', () => {
      const input = 'Word1234Word';
      const result = toPascalCase(input);
      expect(result).toEqual('Word1234Word');
    });
    it('handles complex cases', () => {
      const input = 'a0a0aa0';
      const result = toPascalCase(input);
      expect(result).toEqual('A0A0Aa0');
    });
  });

  describe('non-alphabetic', () => {
    it('handles non-alphanumeric characters', () => {
      const input = 'This@Is_A^Test';
      const result = toPascalCase(input);
      expect(result).toEqual('ThisIsATest');
    });

    it('handles multiple non-alphanumeric characters', () => {
      const input = 'This@@Is__A^^Test';
      const result = toPascalCase(input);
      expect(result).toEqual('ThisIsATest');
    });
  });

  describe('without prefix', () => {
    it('removes prefix', () => {
      const input = 'PrefixWord';
      const result = toPascalCase(input, { trimPrefix: 'Prefix' });
      expect(result).toEqual('Word');
    });

    it('does not remove prefix if it does not match', () => {
      const input = 'SomethingElsePrefixWord';
      const result = toPascalCase(input, { trimPrefix: 'Pre' });
      expect(result).toEqual('SomethingElsePrefixWord');
    });
  });
});
