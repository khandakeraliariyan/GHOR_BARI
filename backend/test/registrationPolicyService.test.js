import test from "node:test";
import assert from "node:assert/strict";

import { getPublicRegistrationRole } from "../src/services/registrationPolicyService.js";

test("public registration always receives the non-privileged user role", () => {
    assert.equal(getPublicRegistrationRole(), "user");
});

test("public registration role cannot be influenced by caller input", () => {
    const maliciousPayload = { role: "admin" };
    assert.notEqual(getPublicRegistrationRole(maliciousPayload.role), maliciousPayload.role);
});
