export default {
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/**/*.test.js"],
    collectCoverageFrom: [
        "src/models/Chat.js",
        "src/middleware/verifyOwner.js",
        "src/services/propertyDescriptionPromptService.js",
        "src/services/registrationPolicyService.js",
    ],
    coverageDirectory: "coverage",
};
