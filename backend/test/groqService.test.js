import { jest, test, expect, afterEach } from "@jest/globals";

const ORIGINAL_KEY = process.env.GROQ_API_KEY;

afterEach(() => {
  if (ORIGINAL_KEY === undefined) {
    delete process.env.GROQ_API_KEY;
  } else {
    process.env.GROQ_API_KEY = ORIGINAL_KEY;
  }
  jest.resetModules();
});

test("getGroqModel always returns the configured model id", async () => {
  process.env.GROQ_API_KEY = "test-key";
  jest.resetModules();
  const { getGroqModel } = await import("../src/services/groqService.js");
  expect(getGroqModel()).toBe("llama-3.1-8b-instant");
});

test("ensureGroqConfigured throws a 500 error when no API key was set at startup", async () => {
  delete process.env.GROQ_API_KEY;
  jest.resetModules();
  const { ensureGroqConfigured } = await import("../src/services/groqService.js");

  try {
    ensureGroqConfigured();
    throw new Error("expected ensureGroqConfigured to throw");
  } catch (error) {
    expect(error.message).toBe("AI service is not configured");
    expect(error.statusCode).toBe(500);
    expect(error.details).toBe("GROQ_API_KEY is not set");
  }
});

test("ensureGroqConfigured does not throw once an API key was set at startup", async () => {
  process.env.GROQ_API_KEY = "test-key";
  jest.resetModules();
  const { ensureGroqConfigured } = await import("../src/services/groqService.js");
  expect(() => ensureGroqConfigured()).not.toThrow();
});

test("generateGroqText refuses to call the API without a configured key", async () => {
  delete process.env.GROQ_API_KEY;
  jest.resetModules();
  const { generateGroqText } = await import("../src/services/groqService.js");

  await expect(generateGroqText({ systemPrompt: "sys", userPrompt: "hi" }))
    .rejects.toThrow("AI service is not configured");
});
