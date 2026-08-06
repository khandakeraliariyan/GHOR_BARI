import { jest, test, expect, afterEach } from "@jest/globals";
import { ObjectId } from "mongodb";

jest.unstable_mockModule("../src/config/db.js", () => ({
  getDatabase: jest.fn(),
}));
jest.unstable_mockModule("../src/services/nidRegistryService.js", () => ({
  findByNidNumber: jest.fn(),
}));

const { getDatabase } = await import("../src/config/db.js");
const { findByNidNumber } = await import("../src/services/nidRegistryService.js");
const { verifyPendingUserByNid } = await import("../src/services/nidVerificationService.js");

afterEach(() => {
  getDatabase.mockReset();
  findByNidNumber.mockReset();
});

test("rejects an invalid user id without querying the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  getDatabase.mockReturnValue(db);

  const result = await verifyPendingUserByNid("not-an-id");
  expect(result).toEqual({ ok: false, status: 400, message: "Invalid user id" });
});

test("returns 404 when the user does not exist", async () => {
  const db = { collection: () => ({ async findOne() { return null; } }) };
  getDatabase.mockReturnValue(db);

  const result = await verifyPendingUserByNid(new ObjectId().toString());
  expect(result).toEqual({ ok: false, status: 404, message: "User not found" });
});

test("refuses to process a user whose verification is not pending", async () => {
  const db = { collection: () => ({ async findOne() { return { nidVerified: "verified" }; } }) };
  getDatabase.mockReturnValue(db);

  const result = await verifyPendingUserByNid(new ObjectId().toString());
  expect(result).toEqual({
    ok: false,
    status: 400,
    message: "Only pending verification requests can be processed",
    nidVerified: "verified",
  });
});

test("refuses when the pending user has no NID number on file", async () => {
  const db = { collection: () => ({ async findOne() { return { nidVerified: "pending", nidNumber: "   " }; } }) };
  getDatabase.mockReturnValue(db);

  const result = await verifyPendingUserByNid(new ObjectId().toString());
  expect(result).toEqual({ ok: false, status: 400, message: "User has not submitted a valid NID number" });
  expect(findByNidNumber).not.toHaveBeenCalled();
});

test("marks the user verified when the registry has a matching record", async () => {
  let updateFilter;
  let updateValue;
  const db = {
    collection: () => ({
      async findOne() { return { nidVerified: "pending", nidNumber: "1234567890" }; },
      async updateOne(filter, value) { updateFilter = filter; updateValue = value; return { matchedCount: 1 }; },
    }),
  };
  getDatabase.mockReturnValue(db);
  findByNidNumber.mockResolvedValue({ nidNumber: "1234567890" });

  const result = await verifyPendingUserByNid(new ObjectId().toString());
  expect(result.ok).toBe(true);
  expect(result.matched).toBe(true);
  expect(result.nidVerified).toBe("verified");
  expect(updateFilter.nidVerified).toBe("pending");
  expect(updateValue.$set.nidVerified).toBe("verified");
  expect(updateValue.$set.nidVerifiedAt).toBeInstanceOf(Date);
});

test("marks the user rejected when no registry record matches", async () => {
  const db = {
    collection: () => ({
      async findOne() { return { nidVerified: "pending", nidNumber: "0000000000" }; },
      async updateOne() { return { matchedCount: 1 }; },
    }),
  };
  getDatabase.mockReturnValue(db);
  findByNidNumber.mockResolvedValue(null);

  const result = await verifyPendingUserByNid(new ObjectId().toString());
  expect(result).toEqual({ ok: true, matched: false, nidVerified: "rejected" });
});

test("reports a conflict when the request was already processed concurrently", async () => {
  const usersCollection = {
    findOne: jest.fn()
      .mockResolvedValueOnce({ nidVerified: "pending", nidNumber: "1234567890" })
      .mockResolvedValueOnce({ nidVerified: "verified" }),
    async updateOne() { return { matchedCount: 0 }; },
  };
  const db = { collection: () => usersCollection };
  getDatabase.mockReturnValue(db);
  findByNidNumber.mockResolvedValue({ nidNumber: "1234567890" });

  const result = await verifyPendingUserByNid(new ObjectId().toString());
  expect(result).toEqual({
    ok: false,
    status: 409,
    message: "Verification request was already processed",
    nidVerified: "verified",
  });
});
