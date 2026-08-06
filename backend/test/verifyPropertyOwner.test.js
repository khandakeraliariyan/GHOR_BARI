import { jest, test, expect, afterEach } from "@jest/globals";
import { ObjectId } from "mongodb";

jest.unstable_mockModule("../src/config/db.js", () => ({
  getDatabase: jest.fn(),
}));

const { getDatabase } = await import("../src/config/db.js");
const { verifyPropertyOwner } = await import("../src/middleware/verifyPropertyOwner.js");

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

test("rejects an invalid property id without querying the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyPropertyOwner({ params: { id: "not-an-id" }, user: { email: "a@example.com" } }, res, () => { called = true; });

  expect(called).toBe(false);
  expect(res.statusCode).toBe(400);
  expect(res.body).toEqual({ message: "Invalid ID format" });
});

test("returns 404 when the property does not exist", async () => {
  const db = { collection: () => ({ findOne: async () => null }) };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyPropertyOwner({ params: { id: new ObjectId().toString() }, user: { email: "a@example.com" } }, res, () => { called = true; });

  expect(called).toBe(false);
  expect(res.statusCode).toBe(404);
});

test("rejects a caller who does not own the property", async () => {
  const property = { _id: new ObjectId(), owner: { email: "owner@example.com" } };
  const db = { collection: () => ({ findOne: async () => property }) };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyPropertyOwner({ params: { id: property._id.toString() }, user: { email: "someone-else@example.com" } }, res, () => { called = true; });

  expect(called).toBe(false);
  expect(res.statusCode).toBe(403);
});

test("attaches the property and proceeds for the matching owner", async () => {
  const property = { _id: new ObjectId(), owner: { email: "owner@example.com" } };
  const db = { collection: () => ({ findOne: async () => property }) };
  getDatabase.mockReturnValue(db);

  const req = { params: { id: property._id.toString() }, user: { email: "owner@example.com" } };
  const res = responseRecorder();
  let called = false;
  await verifyPropertyOwner(req, res, () => { called = true; });

  expect(called).toBe(true);
  expect(req.property).toBe(property);
});

test("returns 500 when the database throws", async () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const db = { collection: () => ({ findOne: async () => { throw new Error("boom"); } }) };
  getDatabase.mockReturnValue(db);

  const res = responseRecorder();
  let called = false;
  await verifyPropertyOwner({ params: { id: new ObjectId().toString() }, user: { email: "a@example.com" } }, res, () => { called = true; });

  expect(called).toBe(false);
  expect(res.statusCode).toBe(500);
  expect(consoleErrorSpy).toHaveBeenCalledWith("verifyPropertyOwner error:", expect.any(Error));

  consoleErrorSpy.mockRestore();
});
