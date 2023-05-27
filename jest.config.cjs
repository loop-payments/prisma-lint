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
    "^#src/(.*)\\.js$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
};

export default {
  testTimeout: testTimeout(),
  projects: [unitTestConfig],
};
