import test from "node:test";
import assert from "node:assert/strict";

import {
  getInitials,
  getLastMessagePreview,
  getStatusColor,
  isUserOnline,
  shouldShowTimestamp,
  truncateText,
} from "../src/Utilities/ChatHelpers.js";

test("truncateText preserves short text and truncates long text", () => {
  assert.equal(truncateText("short", 10), "short");
  assert.equal(truncateText("abcdefghijk", 5), "abcde...");
  assert.equal(truncateText("", 5), "");
});

test("getInitials handles names and missing values", () => {
  assert.equal(getInitials("Nayef Wasit Siddiqui"), "NW");
  assert.equal(getInitials("Nayef"), "N");
  assert.equal(getInitials(), "?");
});

test("shouldShowTimestamp detects sender and time changes", () => {
  const first = { createdAt: "2026-07-19T10:00:00Z", senderEmail: "a@example.com" };
  const near = { createdAt: "2026-07-19T10:03:00Z", senderEmail: "a@example.com" };
  const late = { createdAt: "2026-07-19T10:06:00Z", senderEmail: "a@example.com" };
  const other = { createdAt: "2026-07-19T10:01:00Z", senderEmail: "b@example.com" };

  assert.equal(shouldShowTimestamp(first), true);
  assert.equal(shouldShowTimestamp(near, first), false);
  assert.equal(shouldShowTimestamp(late, first), true);
  assert.equal(shouldShowTimestamp(other, first), true);
});

test("online and preview helpers return user-facing values", () => {
  assert.equal(isUserOnline("a@example.com", ["a@example.com"]), true);
  assert.equal(isUserOnline("b@example.com", ["a@example.com"]), false);
  assert.equal(getStatusColor(true), "bg-green-500");
  assert.equal(getStatusColor(false), "bg-gray-400");
  assert.equal(getLastMessagePreview(null), "No messages yet");
  assert.equal(getLastMessagePreview("Hello", "me@example.com", "me@example.com"), "You: Hello");
});
