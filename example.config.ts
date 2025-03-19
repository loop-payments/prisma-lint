import { defineConfig } from './src/config/define-config.js';

export default defineConfig({
  rules: {
    'ban-unbounded-string-type': {
      // The rule configuration will be type-checked based on the Zod schema
      severity: 'error',
      options: {
        allowedTypes: ['string', 'String'],
      },
    },
    'no-empty-blocks': {
      severity: 'warn',
    },
    'require-field-type-length': {
      severity: 'error',
    },
    'require-field-type-match': {
      severity: 'error',
    },
    'require-unique-index-name': {
      severity: 'error',
    },
  },
  // TypeScript will provide autocomplete and type checking here
});
