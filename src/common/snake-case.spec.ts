import { toSnakeCase } from "#src/common/snake-case.js";

describe("toSnakeCase", () => {
  describe("cases", () => {
    it("converts single-word string to snake case", () => {
      const input = "hello";
      const result = toSnakeCase(input);
      expect(result).toEqual("hello");
    });

    it("converts camel case string to snake case", () => {
      const input = "camelCaseString";
      const result = toSnakeCase(input);
      expect(result).toEqual("camel_case_string");
    });

    it("converts Pascal case string to snake case", () => {
      const input = "PascalCaseString";
      const result = toSnakeCase(input);
      expect(result).toEqual("pascal_case_string");
    });

    it("converts kebab case string to snake case", () => {
      const input = "kebab-case-string";
      const result = toSnakeCase(input);
      expect(result).toEqual("kebab_case_string");
    });

    it("converts snake case string to snake case", () => {
      const input = "snake_case_string";
      const result = toSnakeCase(input);
      expect(result).toEqual("snake_case_string");
    });
  });

  describe("compound words", () => {
    it("respects compound words", () => {
      const input = "HelloWorldGraphQL";
      const result = toSnakeCase(input, ["GraphQL"]);
      expect(result).toEqual("hello_world_graphql");
    });
  });

  describe("numbers", () => {
    it("keeps numbers with the previous word", () => {
      const input = "AmazonS3";
      const result = toSnakeCase(input);
      expect(result).toEqual("amazon_s3");
    });

    it("handles consecutive numbers", () => {
      const input = "Word1234Word";
      const result = toSnakeCase(input);
      expect(result).toEqual("word1234_word");
    });
  });

  it("handles non-alphanumeric characters", () => {
    const input = "This@Is_A^Test";
    const result = toSnakeCase(input);
    expect(result).toEqual("this_is_a_test");
  });
});
