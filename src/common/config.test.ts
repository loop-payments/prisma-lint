import { z } from 'zod';

import { parseRuleConfigList } from '#src/common/config.js';
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
  const ruleRegistry = {
    'fake-rule': fakeRule,
  };

  describe('valid config', () => {
    it('returns parsed config and no parse issues', () => {
      const result = parseRuleConfigList(ruleRegistry, {
        rules: {
          'fake-rule': ['error', { foo: 'bar' }],
        },
      });
      expect(result.parseIssues).toEqual([]);
      expect(result.ruleConfigList.length).toEqual(1);
      expect(result.ruleConfigList[0][0]).toEqual('fake-rule');
      expect(result.ruleConfigList[0][1]).toEqual({ foo: 'bar' });
    });
  });

  describe('invalid config', () => {
    it('returns parse issues', () => {
      const result = parseRuleConfigList(ruleRegistry, {
        rules: {
          'fake-rule': ['error', { foo: 123 }],
        },
      });
      expect(result.parseIssues.length).toEqual(1);
      expect(result.parseIssues[0]).toEqual(
        "Failed to parse config for rule 'fake-rule':\n" +
          '  Expected string, received number',
      );
      expect(result.ruleConfigList.length).toEqual(0);
    });
  });
});
