const isDebuggerAttached = (() => {
  try {
    return !!require("inspector").url();
  } catch (e) {
    return false;
  }
})();

const testTimeout = () => (isDebuggerAttached ? 2 ** 31 - 1 : 60000);

const unitTestConfig = {
  moduleDirectories: ["node_modules"],
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  roots: ["<rootDir>/src/"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.[jt]s$",
  displayName: {
    name: "unit",
    color: "blue",
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
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
