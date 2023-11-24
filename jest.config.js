const isDebuggerAttached = (() => {
  try {
    return !!require('inspector').url();
  } catch (e) {
    return false;
  }
})();

const testTimeout = () => (isDebuggerAttached ? Infinity : 60000);

const unitTestConfig = {
  moduleDirectories: ['node_modules'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: ['./jest-setup/unit-test-setup.js'],
  roots: ['<rootDir>/src/'],
  testEnvironment: 'node',
  testRegex: '.*\\.test\\.ts$',
  displayName: {
    name: 'unit',
    color: 'blue',
  },
  moduleNameMapper: {
    '^#src/(.*)\\.js$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { useESM: true, tsconfig: './tsconfig.test.json' },
    ],
  },
};

export default {
  testTimeout: testTimeout(),
  projects: [unitTestConfig],
};
