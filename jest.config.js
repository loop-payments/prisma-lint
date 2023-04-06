const isDebuggerAttached = (() => {
  try {
    return !!require("inspector").url();
  } catch (e) {
    return false;
  }
})();

const testTimeout = () => (isDebuggerAttached ? Infinity : 60000);

const unitTestConfig = {
  moduleDirectories: ["node_modules"],
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["js", "ts"],
  roots: ["<rootDir>/src/"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  displayName: {
    name: "unit",
    color: "blue",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
};

export default {
  testTimeout: testTimeout(),
  projects: [unitTestConfig],

  // Special configuration options set to work around an upstream memory issue.
  // https://github.com/facebook/jest/issues/11956
  // https://loop-payments.slack.com/archives/C01MYBY9GJC/p1672264037166109
  workerIdleMemoryLimit: "512MiB",
  maxWorkers: "2",
  logHeapUsage: true,
};
