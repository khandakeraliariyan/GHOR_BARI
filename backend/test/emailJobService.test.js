import { jest, test, expect, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js", () => ({
  getDatabase: jest.fn(),
}));

const { getDatabase } = await import("../src/config/db.js");
const { enqueueEmailJob } = await import("../src/services/emailJobService.js");

afterEach(() => {
  getDatabase.mockReset();
});

test("refuses to queue a job without a recipient, without touching the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  getDatabase.mockReturnValue(db);

  const result = await enqueueEmailJob({ type: "deal_completed", to: undefined, payload: {} });
  expect(result).toEqual({ queued: false, reason: "missing_recipient" });
});

test("inserts a pending job with sane defaults", async () => {
  let inserted;
  const db = { collection: () => ({ async insertOne(job) { inserted = job; return { insertedId: "job-1" }; } }) };
  getDatabase.mockReturnValue(db);

  const result = await enqueueEmailJob({
    type: "deal_completed",
    to: "user@example.com",
    payload: { propertyTitle: "Sunny Flat" },
    dedupeKey: "deal_completed:app-1:user@example.com",
  });

  expect(result).toEqual({ queued: true });
  expect(inserted.type).toBe("deal_completed");
  expect(inserted.to).toBe("user@example.com");
  expect(inserted.status).toBe("pending");
  expect(inserted.attempts).toBe(0);
  expect(inserted.maxAttempts).toBe(5);
  expect(inserted.notification).toEqual({ read: false, readAt: null });
  expect(inserted.nextRunAt).toBeInstanceOf(Date);
});

test("honors a custom maxAttempts value", async () => {
  let inserted;
  const db = { collection: () => ({ async insertOne(job) { inserted = job; return { insertedId: "job-1" }; } }) };
  getDatabase.mockReturnValue(db);

  await enqueueEmailJob({ type: "deal_completed", to: "user@example.com", payload: {}, maxAttempts: 2 });
  expect(inserted.maxAttempts).toBe(2);
});

test("treats a duplicate key error as a graceful no-op", async () => {
  const duplicateError = Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
  const db = { collection: () => ({ async insertOne() { throw duplicateError; } }) };
  getDatabase.mockReturnValue(db);

  const result = await enqueueEmailJob({ type: "deal_completed", to: "user@example.com", payload: {} });
  expect(result).toEqual({ queued: false, reason: "duplicate" });
});

test("re-throws unexpected database errors", async () => {
  const db = { collection: () => ({ async insertOne() { throw new Error("connection lost"); } }) };
  getDatabase.mockReturnValue(db);

  await expect(enqueueEmailJob({ type: "deal_completed", to: "user@example.com", payload: {} }))
    .rejects.toThrow("connection lost");
});
