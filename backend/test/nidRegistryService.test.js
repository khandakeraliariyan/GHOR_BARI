import { jest, test, expect, afterEach } from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js", () => ({
  getDatabase: jest.fn(),
}));

const { getDatabase } = await import("../src/config/db.js");
const { findByNidNumber } = await import("../src/services/nidRegistryService.js");

afterEach(() => {
  getDatabase.mockReset();
});

test("returns null without querying the database for a missing NID number", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  getDatabase.mockReturnValue(db);
  expect(await findByNidNumber(undefined)).toBeNull();
  expect(await findByNidNumber(null)).toBeNull();
});

test("returns null for non-string input without querying the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  getDatabase.mockReturnValue(db);
  expect(await findByNidNumber(123456)).toBeNull();
});

test("returns null for a whitespace-only NID number without querying the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  getDatabase.mockReturnValue(db);
  expect(await findByNidNumber("   ")).toBeNull();
});

test("queries the nids collection with a trimmed NID number", async () => {
  let filter;
  const record = { nidNumber: "1234567890", fullName: "John Doe" };
  const db = {
    collection(name) {
      expect(name).toBe("nids");
      return { async findOne(value) { filter = value; return record; } };
    },
  };
  getDatabase.mockReturnValue(db);

  const result = await findByNidNumber("  1234567890  ");
  expect(result).toBe(record);
  expect(filter).toEqual({ nidNumber: "1234567890" });
});

test("returns null when no matching registry record exists", async () => {
  const db = { collection: () => ({ async findOne() { return null; } }) };
  getDatabase.mockReturnValue(db);
  expect(await findByNidNumber("0000000000")).toBeNull();
});
