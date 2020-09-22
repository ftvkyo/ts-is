module.exports = {
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  roots: [
    "build-test",
    "build-unittest",
  ],

  // The test environment that will be used for testing
  testEnvironment: "node",
};
