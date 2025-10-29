import type { RuleConfig } from '#src/common/config.js';
import { testLintPrismaSource } from '#src/common/test.js';
import enumValueCase from '#src/rules/enum-value-case.js';

describe('enum-value-case', () => {
  const getRunner = (config: RuleConfig) => async (sourceCode: string) =>
    await testLintPrismaSource({
      fileName: 'fake.ts',
      sourceCode,
      rootConfig: {
        rules: {
          'enum-value-case': ['error', config],
        },
      },
      ruleDefinitions: [enumValueCase],
    });

  describe('snake', () => {
    describe('ignore comments', () => {
      const run = getRunner({
        style: 'snake',
      });

      it('respects rule-specific ignore comments', async () => {
        const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum enum-value-case
          PascalCase
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('respects model-wide ignore comments', async () => {
        const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum
          PascalCase
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('respects parametised field ignore comments', async () => {
        const violations = await run(`
          enum Example {
            /// prisma-lint-ignore-enum enum-value-case InvalidTwo,InvalidThree
            valid_one
            InvalidTwo
            InvalidThree
            InvalidFour
            InvalidFive
          }
          `);
        expect(violations.length).toEqual(2);
      });
    });

    describe('style only', () => {
      const run = getRunner({
        style: 'snake',
      });

      describe('single lowercase word', () => {
        it('returns no violations', async () => {
          const violations = await run(`
          enum Example {
            value
          }
        `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('digit requires underscore', () => {
        it('returns violation', async () => {
          const violations = await run(`
            enum Example {
              value1
            }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('digit allowed after underscore', () => {
        it('returns no violations', async () => {
          const violations = await run(`
              enum Example {
                value_1
              }
            `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('compound word in PascalCase', () => {
        it('returns violations', async () => {
          const violations = await run(`
          enum Example {
            ExampleValue
          }
        `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('first character is uppercase', () => {
        it('returns violation', async () => {
          const violations = await run(`
          enum Example {
            Value
          }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in valid snake case', () => {
        it('returns no violations', async () => {
          const violations = await run(`
          enum Example {
            example_option
          }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });

    describe('with upper case config', () => {
      const run = getRunner({ style: 'snake', case: 'upper' });

      it('returns violation', async () => {
        const violations = await run(`
        enum Example {
          value_one
        }
        `);
        expect(violations.length).toEqual(1);
      });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          VALUE_ONE
        }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with compound words config', () => {
      const run = getRunner({ style: 'snake', compoundWords: ['API'] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          an_api_key
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('allowList string requires full match', async () => {
        const violations = await run(`
        enum Example {
          ForAPIKey
        }
        `);
        expect(violations.length).toEqual(1);
        expect(violations[0].message).toEqual(
          "Enum value should be in snake_case: 'ForAPIKey' (expected 'for_api_key').",
        );
      });
    });

    describe('with allowlist string', () => {
      const run = getRunner({ style: 'snake', allowList: ['exampleOptions'] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          exampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('allowList string requires full match', async () => {
        const violations = await run(`
        enum Example {
          exampleOptionsWithSuffix
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with allowlist regexp', () => {
      const run = getRunner({ style: 'snake', allowList: [/^DB.*/] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with trimPrefix single string', () => {
      const run = getRunner({ style: 'snake', trimPrefix: 'DB' });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix must be snake_case', async () => {
        const violations = await run(`
        enum Example {
          dbExampleOptions
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with trimPrefix single regexp', () => {
      const run = getRunner({ style: 'snake', trimPrefix: /^DB/ });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix must be snake_case', async () => {
        const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with trimPrefix array', () => {
      const run = getRunner({ style: 'snake', trimPrefix: ['DB', /^EG/] });

      it('returns no violations for first prefix', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('returns no violations for second prefix', async () => {
        const violations = await run(`
        enum Example {
          EGexample_options
        }
          `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix after string must be snake_case', async () => {
        const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
        expect(violations.length).toEqual(1);
      });

      it('remaining suffix after regexp must be snake_case', async () => {
        const violations = await run(`
        enum Example {
          EGexampleOptions
        }
          `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('camel', () => {
    describe('ignore comments', () => {
      const run = getRunner({
        style: 'camel',
      });

      it('respects rule-specific ignore comments', async () => {
        const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum enum-value-case
          snake_case
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('respects model-wide ignore comments', async () => {
        const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum
          snake_case
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('respects parametised field ignore comments', async () => {
        const violations = await run(`
          enum Example {
            /// prisma-lint-ignore-enum enum-value-case invalid_two,invalid_three
            validOne
            invalid_two
            invalid_three
            invalid_four
            invalid_five
          }
          `);
        expect(violations.length).toEqual(2);
      });
    });

    describe('style only', () => {
      const run = getRunner({
        style: 'camel',
      });

      describe('single lowercase word', () => {
        it('returns no violations', async () => {
          const violations = await run(`
          enum Example {
            value
          }
        `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('digit allowed', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            enum Example {
              value1
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('Underscore is not allowed', () => {
        it('returns violations', async () => {
          const violations = await run(`
              enum Example {
                value_1
              }
            `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in PascalCase', () => {
        it('returns violations', async () => {
          const violations = await run(`
          enum Example {
            ExampleValue
          }
        `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in snake_case', () => {
        it('returns violations', async () => {
          const violations = await run(`
          enum Example {
            example_value
          }
        `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('first character is uppercase', () => {
        it('returns violation', async () => {
          const violations = await run(`
          enum Example {
            Value
          }
          `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in valid camelCase', () => {
        it('returns no violations', async () => {
          const violations = await run(`
          enum Example {
            exampleOption
          }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });

    describe('with compound words config', () => {
      const run = getRunner({ style: 'camel', compoundWords: ['API'] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          anAPIKey
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('allowList string requires full match', async () => {
        const violations = await run(`
        enum Example {
          ForAPIKey
        }
        `);
        expect(violations.length).toEqual(1);
        expect(violations[0].message).toEqual(
          "Enum value should be in camelCase: 'ForAPIKey' (expected 'forAPIKey').",
        );
      });
    });

    describe('with allowlist string', () => {
      const run = getRunner({ style: 'camel', allowList: ['example_options'] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          example_options
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('allowList string requires full match', async () => {
        const violations = await run(`
        enum Example {
          example_options_with_suffix
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with allowlist regexp', () => {
      const run = getRunner({ style: 'camel', allowList: [/^DB.*/] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with trimPrefix single string', () => {
      const run = getRunner({ style: 'camel', trimPrefix: 'DB' });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix must be camelCase', async () => {
        const violations = await run(`
        enum Example {
          dbexample_options
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with trimPrefix single regexp', () => {
      const run = getRunner({ style: 'camel', trimPrefix: /^DB/ });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix must be camelCase', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with trimPrefix array', () => {
      const run = getRunner({ style: 'camel', trimPrefix: ['DB', /^EG/] });

      it('returns no violations for first prefix', async () => {
        const violations = await run(`
        enum Example {
          DBexampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('returns no violations for second prefix', async () => {
        const violations = await run(`
        enum Example {
          EGexampleOptions
        }
          `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix after string must be camelCase', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(1);
      });

      it('remaining suffix after regexp must be camelCase', async () => {
        const violations = await run(`
        enum Example {
          EGexample_options
        }
          `);
        expect(violations.length).toEqual(1);
      });
    });
  });

  describe('pascal', () => {
    describe('ignore comments', () => {
      const run = getRunner({
        style: 'pascal',
      });

      it('respects rule-specific ignore comments', async () => {
        const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum enum-value-case
          snake_case
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('respects model-wide ignore comments', async () => {
        const violations = await run(`
        enum Example {
          /// prisma-lint-ignore-enum
          snake_case
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('respects parametised field ignore comments', async () => {
        const violations = await run(`
          enum Example {
            /// prisma-lint-ignore-enum enum-value-case invalid_two,invalid_three
            ValidOne
            invalid_two
            invalid_three
            invalid_four
            invalid_five
          }
          `);
        expect(violations.length).toEqual(2);
      });
    });

    describe('style only', () => {
      const run = getRunner({
        style: 'pascal',
      });

      describe('single lowercase word', () => {
        it('returns no violations', async () => {
          const violations = await run(`
          enum Example {
            Value
          }
        `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('digit allowed', () => {
        it('returns no violations', async () => {
          const violations = await run(`
            enum Example {
              Value1
            }
          `);
          expect(violations.length).toEqual(0);
        });
      });

      describe('Underscore is not allowed', () => {
        it('returns violations', async () => {
          const violations = await run(`
              enum Example {
                value_1
              }
            `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in camelCase', () => {
        it('returns violations', async () => {
          const violations = await run(`
          enum Example {
            exampleValue
          }
        `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in snake_case', () => {
        it('returns violations', async () => {
          const violations = await run(`
          enum Example {
            example_value
          }
        `);
          expect(violations.length).toEqual(1);
        });
      });

      describe('compound word in valid PascalCase', () => {
        it('returns no violations', async () => {
          const violations = await run(`
          enum Example {
            ExampleOption
          }
          `);
          expect(violations.length).toEqual(0);
        });
      });
    });

    describe('with compound words config', () => {
      const run = getRunner({ style: 'pascal', compoundWords: ['API'] });

      it('Compound word at the beginning', async () => {
        const violations = await run(`
        enum Example {
          AnAPIKey
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('Compound word in the middle', async () => {
        const violations = await run(`
        enum Example {
          APIKey
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('Compound word at the end', async () => {
        const violations = await run(`
        enum Example {
          AnAPI
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('allowList string requires full match', async () => {
        const violations = await run(`
        enum Example {
          forAPIKey
        }
        `);
        expect(violations.length).toEqual(1);
        expect(violations[0].message).toEqual(
          "Enum value should be in PascalCase: 'forAPIKey' (expected 'ForAPIKey').",
        );
      });
    });

    describe('with allowlist string', () => {
      const run = getRunner({
        style: 'pascal',
        allowList: ['example_options'],
      });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          example_options
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('allowList string requires full match', async () => {
        const violations = await run(`
        enum Example {
          example_options_with_suffix
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with allowlist regexp', () => {
      const run = getRunner({ style: 'pascal', allowList: [/^DB.*/] });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(0);
      });
    });

    describe('with trimPrefix single string', () => {
      const run = getRunner({ style: 'pascal', trimPrefix: 'DB' });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBExampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix must be camelCase', async () => {
        const violations = await run(`
        enum Example {
          dbexample_options
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with trimPrefix single regexp', () => {
      const run = getRunner({ style: 'pascal', trimPrefix: /^DB/ });

      it('returns no violations', async () => {
        const violations = await run(`
        enum Example {
          DBExampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix must be PascalCase', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(1);
      });
    });

    describe('with trimPrefix array', () => {
      const run = getRunner({ style: 'pascal', trimPrefix: ['DB', /^EG/] });

      it('returns no violations for first prefix', async () => {
        const violations = await run(`
        enum Example {
          DBExampleOptions
        }
        `);
        expect(violations.length).toEqual(0);
      });

      it('returns no violations for second prefix', async () => {
        const violations = await run(`
        enum Example {
          EGExampleOptions
        }
          `);
        expect(violations.length).toEqual(0);
      });

      it('remaining suffix after string must be PascalCase', async () => {
        const violations = await run(`
        enum Example {
          DBexample_options
        }
        `);
        expect(violations.length).toEqual(1);
      });

      it('remaining suffix after regexp must be PascalCase', async () => {
        const violations = await run(`
        enum Example {
          EGexample_options
        }
          `);
        expect(violations.length).toEqual(1);
      });
    });
  });
});
