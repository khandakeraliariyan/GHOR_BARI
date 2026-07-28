import { test, expect } from "@jest/globals";

import {
  getInitials,
  getLastMessagePreview,
  getStatusColor,
  isUserOnline,
  shouldShowTimestamp,
  truncateText,
} from "../src/Utilities/ChatHelpers.js";

test("truncateText preserves short text and truncates long text", () => {
  expect(truncateText("short", 10)).toBe("short");
  expect(truncateText("abcdefghijk", 5)).toBe("abcde...");
  expect(truncateText("", 5)).toBe("");
});

test("getInitials handles names and missing values", () => {
  expect(getInitials("Nayef Wasit Siddiqui")).toBe("NW");
  expect(getInitials("Nayef")).toBe("N");
  expect(getInitials()).toBe("?");
});

test("shouldShowTimestamp detects sender and time changes", () => {
  const first = { createdAt: "2026-07-19T10:00:00Z", senderEmail: "a@example.com" };
  const near = { createdAt: "2026-07-19T10:03:00Z", senderEmail: "a@example.com" };
  const late = { createdAt: "2026-07-19T10:06:00Z", senderEmail: "a@example.com" };
  const other = { createdAt: "2026-07-19T10:01:00Z", senderEmail: "b@example.com" };

  expect(shouldShowTimestamp(first)).toBe(true);
  expect(shouldShowTimestamp(near, first)).toBe(false);
  expect(shouldShowTimestamp(late, first)).toBe(true);
  expect(shouldShowTimestamp(other, first)).toBe(true);
});

test("online and preview helpers return user-facing values", () => {
  expect(isUserOnline("a@example.com", ["a@example.com"])).toBe(true);
  expect(isUserOnline("b@example.com", ["a@example.com"])).toBe(false);
  expect(getStatusColor(true)).toBe("bg-green-500");
  expect(getStatusColor(false)).toBe("bg-gray-400");
  expect(getLastMessagePreview(null)).toBe("No messages yet");
  expect(getLastMessagePreview("Hello", "me@example.com", "me@example.com")).toBe("You: Hello");
});
