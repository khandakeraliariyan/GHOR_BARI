import { test, expect } from "@jest/globals";

import { getFirebaseAuthErrorMessage } from "../src/Utilities/firebaseAuthErrorMessage.js";

test("maps known Firebase error codes", () => {
  expect(getFirebaseAuthErrorMessage({ code: "auth/invalid-email" }))
    .toBe("Please enter a valid email address.");
});

test("reads nested API error codes and messages", () => {
  expect(getFirebaseAuthErrorMessage({ response: { data: { code: "auth/weak-password" } } }))
    .toBe("Password is too weak. Use at least 6 characters.");
  expect(getFirebaseAuthErrorMessage({ response: { data: { message: "Account disabled" } } }))
    .toBe("Account disabled");
});

test("recognizes Firebase codes embedded in messages and uses fallback", () => {
  expect(getFirebaseAuthErrorMessage({ message: "Firebase: auth/email-already-in-use" }))
    .toBe("An account already exists with this email.");
  expect(getFirebaseAuthErrorMessage({}, "Try again")).toBe("Try again");
});
