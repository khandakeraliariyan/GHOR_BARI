import { jest, test, expect, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js", () => ({
  getDatabase: jest.fn(),
}));

const { getDatabase } = await import("../src/config/db.js");
const { verifyAdmin } = await import("../src/middleware/verifyAdmin.js");

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
  };
}

afterEach(() => {
  getDatabase.mockReset();
});

test("allows a user whose stored role is admin", async () => {
  const db = { collection: () => ({ findOne: async () => ({ email: "admin@example.com", role: "admin" }) }) };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyAdmin({ user: { email: "admin@example.com" } }, res, () => { called = true; });

  expect(called).toBe(true);
  expect(res.statusCode).toBe(200);
});

test("rejects a user whose stored role is not admin", async () => {
  const db = { collection: () => ({ findOne: async () => ({ email: "user@example.com", role: "user" }) }) };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyAdmin({ user: { email: "user@example.com" } }, res, () => { called = true; });

  expect(called).toBe(false);
  expect(res.statusCode).toBe(403);
  expect(res.body).toEqual({ message: "Forbidden Access: Admins Only" });
});

test("rejects when the user record does not exist", async () => {
  const db = { collection: () => ({ findOne: async () => null }) };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyAdmin({ user: { email: "ghost@example.com" } }, res, () => { called = true; });

  expect(called).toBe(false);
  expect(res.statusCode).toBe(403);
});
