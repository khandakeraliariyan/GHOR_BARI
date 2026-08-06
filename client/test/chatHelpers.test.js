import { test, expect } from "@jest/globals";

import {
  formatDate,
  formatTime,
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

test("getLastMessagePreview omits the 'You:' prefix for messages from others", () => {
  expect(getLastMessagePreview("Hi there", "them@example.com", "me@example.com")).toBe("Hi there");
});

test("formatTime returns an empty string for a missing date and a formatted time otherwise", () => {
  expect(formatTime(null)).toBe("");
  expect(formatTime(undefined)).toBe("");
  expect(formatTime("2026-07-19T14:30:00Z")).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
});

test("formatDate returns an empty string for a missing date", () => {
  expect(formatDate(null)).toBe("");
  expect(formatDate(undefined)).toBe("");
});

test("formatDate shows a time-only string for today's date", () => {
  const today = new Date();
  expect(formatDate(today)).toBe(formatTime(today));
});

test("formatDate labels yesterday's date as 'Yesterday'", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  expect(formatDate(yesterday)).toBe("Yesterday");
});

test("formatDate shows month/day without a year for older dates in the current year", () => {
  const today = new Date();
  const tenDaysAgo = new Date(today);
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const formatted = formatDate(tenDaysAgo);
  expect(formatted).not.toBe("Yesterday");

  if (tenDaysAgo.getFullYear() === today.getFullYear()) {
    expect(formatted).not.toMatch(String(today.getFullYear()));
  }
});

test("formatDate includes the year for dates from a previous year", () => {
  const formatted = formatDate("2020-03-15T00:00:00Z");
  expect(formatted).toMatch("2020");
  expect(formatted).toMatch(/Mar/);
});
