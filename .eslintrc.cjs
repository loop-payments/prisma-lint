module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-canonical',
    'import',
    'jest',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintcache',
    '.eslintrc.js',
    '/eslint-plugin-loop',
    '/dist',
    '*.d.ts',
    '**/*.d.ts',
    '**/*.cjs',
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/no-misused-promises': ['error'],
    '@typescript-eslint/no-non-null-assertion': ['error'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',

    'canonical/filename-match-regex': [
      'error',
      { regex: '^[0-9a-z-.]+$', ignoreExporting: false },
    ],
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        'newlines-between': 'always-and-inside-groups',
      },
    ],
    'jest/no-identical-title': 'error',
    // Prettier takes care of code width. This is just for comments.
    'max-len': [
      'error',
      {
        code: Infinity,
        comments: 100,
        ignorePattern: '( = |eslint|http|AND |src|ts-ignore|yarn)',
      },
    ],
    'no-console': 'error',
    'no-debugger': 'error',
    'no-useless-catch': 'error',
    'no-useless-return': 'error',
    'prefer-template': 'error',
    'sort-imports': 'off',
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: true, // this loads <rootdir>/tsconfig.json to eslint
      node: true,
    },
  },
};
