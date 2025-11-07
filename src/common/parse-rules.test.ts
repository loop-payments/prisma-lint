import { z } from 'zod';

import { parseRules } from '#src/common/parse-rules.js';
import type { ModelRuleDefinition } from '#src/common/rule.js';

describe('parse rule config list', () => {
  const Config = z.object({ foo: z.string() });
  const fakeRule = {
    ruleName: 'fake-rule',
    configSchema: Config,
    create: (_, context) => {
      return {
        Model: (model) => {
          context.report({ model, message: 'fake-message' });
        },
      };
    },
  } satisfies ModelRuleDefinition<z.infer<typeof Config>>;

  const NoConfig = z.object({}).strict();
  const fakeRuleWithoutConfig = {
    ruleName: 'fake-rule-without-config',
    configSchema: NoConfig,
    create: (_, context) => {
      return {
        Model: (model) => {
          context.report({ model, message: 'fake-message' });
        },
      };
    },
  } satisfies ModelRuleDefinition<z.infer<typeof NoConfig>>;

  const ruleDefinitions = [fakeRule, fakeRuleWithoutConfig];

  describe('valid config', () => {
    describe('with rule-specific config', () => {
      it('returns parsed config and no parse issues', () => {
        const result = parseRules(ruleDefinitions, {
          rules: {
            'fake-rule': ['error', { foo: 'bar' }],
          },
        });
        expect(result.parseIssues).toEqual([]);
        expect(result.deprecationWarnings).toEqual([]);
        expect(result.rules.length).toEqual(1);
        expect(result.rules[0].ruleDefinition.ruleName).toEqual('fake-rule');
        expect(result.rules[0].ruleConfig).toEqual({ foo: 'bar' });
      });
    });

    describe('without rule-specific config', () => {
      it('returns parsed config and no parse issues', () => {
        const result = parseRules(ruleDefinitions, {
          rules: {
            'fake-rule-without-config': ['error'],
          },
        });
        expect(result.parseIssues).toEqual([]);
        expect(result.deprecationWarnings).toEqual([]);
        expect(result.rules.length).toEqual(1);
        expect(result.rules[0].ruleDefinition.ruleName).toEqual(
          'fake-rule-without-config',
        );
        expect(result.rules[0].ruleConfig).toEqual({});
      });
    });
  });

  describe('invalid config', () => {
    it('returns parse issues', () => {
      const result = parseRules(ruleDefinitions, {
        rules: {
          'fake-rule': ['error', { foo: 123 }],
        },
      });
      expect(result.parseIssues.length).toEqual(1);
      expect(result.parseIssues[0]).toEqual(
        "Failed to parse config for rule 'fake-rule':\n" +
          '  Expected string, received number',
      );
      expect(result.rules.length).toEqual(0);
    });
  });

  describe('deprecated rule', () => {
    const deprecatedRule = {
      ruleName: 'deprecated-rule',
      configSchema: NoConfig,
      create: (_, context) => {
        return {
          Model: (model) => {
            context.report({ model, message: 'fake-message' });
          },
        };
      },
      deprecated: {
        message: 'This rule is no longer maintained.',
      },
    } satisfies ModelRuleDefinition<z.infer<typeof NoConfig>>;

    const deprecatedRuleWithReplacement = {
      ruleName: 'deprecated-rule-with-replacement',
      configSchema: NoConfig,
      create: (_, context) => {
        return {
          Model: (model) => {
            context.report({ model, message: 'fake-message' });
          },
        };
      },
      deprecated: {
        message: 'This rule has been superseded.',
        replacedBy: 'new-rule',
      },
    } satisfies ModelRuleDefinition<z.infer<typeof NoConfig>>;

    it('returns deprecation warning when deprecated rule is used', () => {
      const result = parseRules([deprecatedRule], {
        rules: {
          'deprecated-rule': 'error',
        },
      });
      expect(result.parseIssues).toEqual([]);
      expect(result.deprecationWarnings).toEqual([
        "Rule 'deprecated-rule' is deprecated. This rule is no longer maintained.",
      ]);
      expect(result.rules.length).toEqual(1);
    });

    it('returns deprecation warning with replacement suggestion', () => {
      const result = parseRules([deprecatedRuleWithReplacement], {
        rules: {
          'deprecated-rule-with-replacement': 'error',
        },
      });
      expect(result.parseIssues).toEqual([]);
      expect(result.deprecationWarnings).toEqual([
        "Rule 'deprecated-rule-with-replacement' is deprecated. This rule has been superseded. Use 'new-rule' instead.",
      ]);
      expect(result.rules.length).toEqual(1);
    });

    it('does not return deprecation warning when deprecated rule is off', () => {
      const result = parseRules([deprecatedRule], {
        rules: {
          'deprecated-rule': 'off',
        },
      });
      expect(result.parseIssues).toEqual([]);
      expect(result.deprecationWarnings).toEqual([]);
      expect(result.rules.length).toEqual(0);
    });
  });
});
