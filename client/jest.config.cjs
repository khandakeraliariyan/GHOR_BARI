module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test/**/*.test.js", "<rootDir>/test/**/*.test.jsx"],
  setupFilesAfterEnv: ["<rootDir>/test/setupTests.js"],
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  collectCoverageFrom: [
    "src/Utilities/ChatHelpers.js",
    "src/Utilities/firebaseAuthErrorMessage.js",
    "src/Utilities/StatusDisplay.js",
    "src/PrivateRoute/PrivateRoute.jsx",
  ],
  coverageDirectory: "coverage",
};
