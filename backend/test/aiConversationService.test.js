import { test, expect } from "@jest/globals";

import { buildConversationHistoryContext } from "../src/services/aiConversationService.js";

test("returns an empty string for missing or empty history", () => {
  expect(buildConversationHistoryContext()).toBe("");
  expect(buildConversationHistoryContext([])).toBe("");
  expect(buildConversationHistoryContext("not-an-array")).toBe("");
});

test("labels bot turns as assistant and user turns as user", () => {
  const history = [
    { isBot: false, text: "Hi there" },
    { isBot: true, text: "Hello, how can I help?" },
  ];
  expect(buildConversationHistoryContext(history)).toBe("user: Hi there\nassistant: Hello, how can I help?");
});

test("collapses excess whitespace in each turn's text", () => {
  const history = [{ isBot: false, text: "  Hello   there  \n friend " }];
  expect(buildConversationHistoryContext(history)).toBe("user: Hello there friend");
});

test("drops turns with empty or missing text", () => {
  const history = [
    { isBot: false, text: "  " },
    { isBot: true, text: "Real reply" },
    { isBot: false },
  ];
  expect(buildConversationHistoryContext(history)).toBe("assistant: Real reply");
});

test("returns an empty string when every turn is blank", () => {
  const history = [{ isBot: false, text: "" }, { isBot: true, text: "   " }];
  expect(buildConversationHistoryContext(history)).toBe("");
});

test("only keeps the most recent maxTurns entries", () => {
  const history = Array.from({ length: 10 }, (_, i) => ({ isBot: false, text: `msg${i}` }));
  const context = buildConversationHistoryContext(history, 3);
  expect(context).toBe("user: msg7\nuser: msg8\nuser: msg9");
});

test("defaults to keeping the last 6 turns when maxTurns is not supplied", () => {
  const history = Array.from({ length: 8 }, (_, i) => ({ isBot: false, text: `msg${i}` }));
  const context = buildConversationHistoryContext(history);
  expect(context.split("\n")).toHaveLength(6);
  expect(context.split("\n")[0]).toBe("user: msg2");
});
