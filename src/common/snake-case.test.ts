import { toSnakeCase, type toSnakeCaseOptions } from '#src/common/snake-case.js';

type TestVariant = [name: string, expected: string, options: toSnakeCaseOptions]

function testOptionVariations(input: string, cases: TestVariant[]) {
  cases.forEach((testCase) => {
    it(testCase[0], () => {
      const out = toSnakeCase(input, testCase[2]);
      expect(out).toEqual(testCase[1]);
    })
  })
}

describe('toSnakeCase', () => {
  describe('cases', () => {
    describe('converts single-word string to snake case', () => {
      testOptionVariations('hello', [
        [""         , 'hello'             , {               }],
        ["screaming", "HELLO"             , {screaming: true}]
      ]);
    });

    describe('converts camel case string to snake case', () => {
      testOptionVariations('camelCaseString', [
        [""         , 'camel_case_string' , {               }],
        ["screaming", "CAMEL_CASE_STRING" , {screaming: true}]
      ]);
    });

    describe('converts Pascal case string to snake case', () => {
      testOptionVariations('PascalCaseString', [
        [""         , 'pascal_case_string', {               }],
        ["screaming", "PASCAL_CASE_STRING", {screaming: true}]
      ]);
    });

    describe('converts kebab case string to snake case', () => {
      testOptionVariations('kebab-case-string', [
        [""         , 'kebab_case_string' , {               }],
        ["screaming", 'KEBAB_CASE_STRING' , {screaming: true}]
      ]);
    });
    describe('converts snake case string to snake case', () => {
      testOptionVariations('snake_case_string', [
        [""         , 'snake_case_string' , {               }],
        ["screaming", 'SNAKE_CASE_STRING' , {screaming: true}]
      ]);
    });
    describe('Preserves abbreviations when converting to snake case', () => {
      testOptionVariations('TestAPISchema', [
        [""         , 'test_api_schema' , {               }],
        ["screaming", 'TEST_API_SCHEMA' , {screaming: true}]
      ]);
    });
  });

  describe('compound words', () => {
    describe('respects compound words', () => {
      testOptionVariations('HelloWorldGraphQL',[
       [""              , "hello_world_graphql", { compoundWords: ['GraphQL']                 }],
       ["with screaming", "HELLO_WORLD_GRAPHQL", { compoundWords: ['GraphQL'], screaming: true}]
      ]);
    });
  });

  describe('require prefix', () => {
    describe('respects required prefix', () => {
      testOptionVariations('FooBar',[
       [""              , "_foo_bar", { requirePrefix: '_'                  }],
       ["with screaming", "_FOO_BAR", { requirePrefix: '_', screaming: true }]
      ]);
    });
  });

  describe('combine many options', () => {
    describe('respects required prefix', () => {
      const testOpts = { requirePrefix: '_', compoundWords: ['k8'], pluralize: true }
      testOptionVariations('k8pod',[
       [""              , "_k8_pods", testOpts                      ],
       ["with screaming", "_K8_PODS", {...testOpts, screaming: true}]
      ]);
    });
  })

  describe('numbers', () => {
    describe('makes numbers their own words', () => {
      testOptionVariations('AmazonS3',[
       [""              , "amazon_s_3", {               }],
       ["with screaming", "AMAZON_S_3", {screaming: true}]
      ]);
    });

    describe('respects compound words with numbers', () => {
      testOptionVariations('AmazonS3',[
       [""             , "amazon_s3", { compoundWords: ['S3']                  }],
       ["wth screaming", "AMAZON_S3", { compoundWords: ['S3'], screaming: true }]
      ]);
    });

    describe('handles consecutive numbers', () => {
      testOptionVariations('Word1234Word',[
       [""              , "word_1234_word", {               }],
       ["with screaming", "WORD_1234_WORD", {screaming: true}]
      ]);
    });
  });

  describe('handles non-alphanumeric characters', () => {
      testOptionVariations('This@Is_A^Test',[
       [""              , "this_is_a_test", {               }],
       ["with screaming", "THIS_IS_A_TEST", {screaming: true}]
      ]);
  });

  describe('without prefix', () => {
    describe('removes prefix', () => {
      testOptionVariations('PrefixWord',[
       [""              , "word", { trimPrefix: 'Prefix'                  }],
       ["with screaming", "WORD", { trimPrefix: 'Prefix', screaming: true }]
      ]);
    });

    describe('does not remove prefix if it does not match', () => {
      testOptionVariations('SomethingElsePrefixWord',[
       ["-", "something_else_prefix_word", { trimPrefix: 'Pre' }]
      ]);
    });
  });
});
