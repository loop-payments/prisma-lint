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
});
