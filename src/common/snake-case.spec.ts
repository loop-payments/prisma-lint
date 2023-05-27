import { getConsistentSnakeCase } from "#src/common/snake-case.js";

describe("toSnakeCase", () => {
  describe("cases", () => {
    it("converts single-word string to snake case", () => {
      const input = "hello";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("hello");
    });

    it("converts camel case string to snake case", () => {
      const input = "camelCaseString";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("camel_case_string");
    });

    it("converts Pascal case string to snake case", () => {
      const input = "PascalCaseString";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("pascal_case_string");
    });

    it("converts kebab case string to snake case", () => {
      const input = "kebab-case-string";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("kebab_case_string");
    });

    it("converts snake case string to snake case", () => {
      const input = "snake_case_string";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("snake_case_string");
    });
  });

  describe("compound words", () => {
    it("respects compound words", () => {
      const input = "HelloWorldGraphQL";
      const result = getConsistentSnakeCase(input, {
        compoundWords: ["GraphQL"],
      });
      expect(result).toEqual("hello_world_graphql");
    });
  });

  describe("numbers", () => {
    it("keeps numbers with the previous word", () => {
      const input = "AmazonS3";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("amazon_s3");
    });

    it("handles consecutive numbers", () => {
      const input = "Word1234Word";
      const result = getConsistentSnakeCase(input);
      expect(result).toEqual("word1234_word");
    });
  });

  it("handles non-alphanumeric characters", () => {
    const input = "This@Is_A^Test";
    const result = getConsistentSnakeCase(input);
    expect(result).toEqual("this_is_a_test");
  });

  describe("without prefix", () => {
    it("removes prefix", () => {
      const input = "PrefixWord";
      const result = getConsistentSnakeCase(input, { withoutPrefix: "Prefix" });
      expect(result).toEqual("word");
    });

    it("does not remove prefix if it does not match", () => {
      const input = "SomethingElsePrefixWord";
      const result = getConsistentSnakeCase(input, { withoutPrefix: "Pre" });
      expect(result).toEqual("something_else_prefix_word");
    });
  });
});
