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

test("recognizes an embedded invalid-credential or weak-password message", () => {
  expect(getFirebaseAuthErrorMessage({ message: "Firebase: auth/invalid-credential" }))
    .toBe("Email or password is incorrect.");
  expect(getFirebaseAuthErrorMessage({ message: "Firebase: auth/weak-password (auth/weak-password)." }))
    .toBe("Password is too weak. Use at least 6 characters.");
});

test("prefers a known error code over the raw message text", () => {
  expect(getFirebaseAuthErrorMessage({ code: "auth/too-many-requests", message: "auth/email-already-in-use" }))
    .toBe("Too many attempts. Please wait a bit and try again.");
});

test("falls back to a nested API error message when the code is unrecognized", () => {
  expect(getFirebaseAuthErrorMessage({ code: "auth/unknown-code", response: { data: { message: "Server says no" } } }))
    .toBe("Server says no");
});

test("uses the default fallback message when nothing else matches", () => {
  expect(getFirebaseAuthErrorMessage({})).toBe("Authentication failed. Please try again.");
  expect(getFirebaseAuthErrorMessage(undefined)).toBe("Authentication failed. Please try again.");
});

test("does not match a partial or unrelated raw message", () => {
  expect(getFirebaseAuthErrorMessage({ message: "Some unrelated network hiccup" }))
    .toBe("Authentication failed. Please try again.");
});
