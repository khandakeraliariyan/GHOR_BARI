import test from "node:test";
import assert from "node:assert/strict";

import { getFirebaseAuthErrorMessage } from "../src/Utilities/firebaseAuthErrorMessage.js";

test("maps known Firebase error codes", () => {
  assert.equal(
    getFirebaseAuthErrorMessage({ code: "auth/invalid-email" }),
    "Please enter a valid email address.",
  );
});

test("reads nested API error codes and messages", () => {
  assert.equal(
    getFirebaseAuthErrorMessage({ response: { data: { code: "auth/weak-password" } } }),
    "Password is too weak. Use at least 6 characters.",
  );
  assert.equal(
    getFirebaseAuthErrorMessage({ response: { data: { message: "Account disabled" } } }),
    "Account disabled",
  );
});

test("recognizes Firebase codes embedded in messages and uses fallback", () => {
  assert.equal(
    getFirebaseAuthErrorMessage({ message: "Firebase: auth/email-already-in-use" }),
    "An account already exists with this email.",
  );
  assert.equal(getFirebaseAuthErrorMessage({}, "Try again"), "Try again");
});
