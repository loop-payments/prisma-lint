import { toSnakeCase } from '#src/common/snake-case.js';

describe('toSnakeCase', () => {
  describe('various input cases', () => {
    it('converts single-word string to snake case', () => {
      const input = 'hello';
      const result = toSnakeCase(input);
      expect(result).toEqual('hello');
    });

    it('converts camel case string to snake case', () => {
      const input = 'camelCaseString';
      const result = toSnakeCase(input);
      expect(result).toEqual('camel_case_string');
    });

    it('converts Pascal case string to snake case', () => {
      const input = 'PascalCaseString';
      const result = toSnakeCase(input);
      expect(result).toEqual('pascal_case_string');
    });

    it('converts kebab case string to snake case', () => {
      const input = 'kebab-case-string';
      const result = toSnakeCase(input);
      expect(result).toEqual('kebab_case_string');
    });

    it('converts snake case string to snake case', () => {
      const input = 'snake_case_string';
      const result = toSnakeCase(input);
      expect(result).toEqual('snake_case_string');
    });

    it('converts upper snake case string to snake case', () => {
      const input = 'SNAKE_CASE_STRING';
      const result = toSnakeCase(input);
      expect(result).toEqual('snake_case_string');
    });
  });

  describe('compound words', () => {
    it('respects compound words', () => {
      const input = 'HelloWorldGraphQL';
      const result = toSnakeCase(input, {
        compoundWords: ['GraphQL'],
      });
      expect(result).toEqual('hello_world_graphql');
    });

    it('respects compound words with many two-word compound words', () => {
      const input = 'GameBRTicketLostSequence';
      const result = toSnakeCase(input, {
        compoundWords: ['Q6', 'QU', 'QX', 'BR', 'LT', 'QP', 'L5', 'TK', 'QT'],
      });
      expect(result).toEqual('game_br_ticket_lost_sequence');
    });

    it('respects multiple compound words', () => {
      const input = 'APIHelloWorldGraphQL';
      const result = toSnakeCase(input, {
        compoundWords: ['API', 'GraphQL'],
      });
      expect(result).toEqual('api_hello_world_graphql');
    });
  });

  describe('upper case', () => {
    it('converts to upper case', () => {
      const input = 'helloWorld';
      const result = toSnakeCase(input, { case: 'upper' });
      expect(result).toEqual('HELLO_WORLD');
    });

    describe('compound words', () => {
      it('respects compound words', () => {
        const input = 'HelloWorldGraphQL';
        const result = toSnakeCase(input, {
          case: 'upper',
          compoundWords: ['GraphQL'],
        });
        expect(result).toEqual('HELLO_WORLD_GRAPHQL');
      });

      it('respects compound words like API', () => {
        const input = 'HelloWorldAPI';
        const result = toSnakeCase(input, {
          case: 'upper',
          compoundWords: ['API'],
        });
        expect(result).toEqual('HELLO_WORLD_API');
      });

      it('respects repeat compound words', () => {
        const input = 'APIHelloWorldAPI';
        const result = toSnakeCase(input, {
          case: 'upper',
          compoundWords: ['API'],
        });
        expect(result).toEqual('API_HELLO_WORLD_API');
      });

      it('respects multiple compound words', () => {
        const input = 'APIHelloWorldGraphQL';
        const result = toSnakeCase(input, {
          case: 'upper',
          compoundWords: ['API', 'GraphQL'],
        });
        expect(result).toEqual('API_HELLO_WORLD_GRAPHQL');
      });
    });
  });

  describe('require prefix', () => {
    it('respects required prefix', () => {
      const input = 'FooBar';
      const result = toSnakeCase(input, {
        requirePrefix: '_',
      });
      expect(result).toEqual('_foo_bar');
    });
  });

  describe('numbers', () => {
    it('makes numbers their own words', () => {
      const input = 'AmazonS3';
      const result = toSnakeCase(input);
      expect(result).toEqual('amazon_s_3');
    });

    it('respects compound words with numbers', () => {
      const input = 'AmazonS3';
      const result = toSnakeCase(input, { compoundWords: ['S3'] });
      expect(result).toEqual('amazon_s3');
    });

    it('handles consecutive numbers', () => {
      const input = 'Word1234Word';
      const result = toSnakeCase(input);
      expect(result).toEqual('word_1234_word');
    });
  });

  it('handles non-alphanumeric characters', () => {
    const input = 'This@Is_A^Test';
    const result = toSnakeCase(input);
    expect(result).toEqual('this_is_a_test');
  });

  describe('without prefix', () => {
    it('removes prefix', () => {
      const input = 'PrefixWord';
      const result = toSnakeCase(input, { trimPrefix: 'Prefix' });
      expect(result).toEqual('word');
    });

    it('does not remove prefix if it does not match', () => {
      const input = 'SomethingElsePrefixWord';
      const result = toSnakeCase(input, { trimPrefix: 'Pre' });
      expect(result).toEqual('something_else_prefix_word');
    });
  });
});
