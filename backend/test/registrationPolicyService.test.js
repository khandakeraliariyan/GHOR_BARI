import { test, expect } from "@jest/globals";

import { getPublicRegistrationRole } from "../src/services/registrationPolicyService.js";

test("public registration always receives the non-privileged user role", () => {
    expect(getPublicRegistrationRole()).toBe("user");
});

test("public registration role cannot be influenced by caller input", () => {
    const maliciousPayload = { role: "admin" };
    expect(getPublicRegistrationRole(maliciousPayload.role)).not.toBe(maliciousPayload.role);
});
