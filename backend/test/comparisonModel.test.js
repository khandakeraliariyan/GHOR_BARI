import { test, expect } from "@jest/globals";
import { ObjectId } from "mongodb";

import { ComparisonModel } from "../src/models/Comparison.js";

test("generateShareLink produces a unique 32-character hex string each call", () => {
  const first = ComparisonModel.generateShareLink();
  const second = ComparisonModel.generateShareLink();
  expect(first).toMatch(/^[0-9a-f]{32}$/);
  expect(first).not.toBe(second);
});

test("create converts property ids and applies defaults", async () => {
  let inserted;
  const insertedId = new ObjectId();
  const db = { collection: () => ({ async insertOne(value) { inserted = value; return { insertedId }; } }) };

  const propertyId = new ObjectId().toString();
  const result = await ComparisonModel.create(db, {
    userId: "user-1",
    userEmail: "user@example.com",
    propertyIds: [propertyId],
  });

  expect(result).toBe(insertedId);
  expect(inserted.title).toBe("Property Comparison");
  expect(inserted.isPublic).toBe(false);
  expect(inserted.propertyIds[0]).toBeInstanceOf(ObjectId);
  expect(inserted.shareLink).toMatch(/^[0-9a-f]{32}$/);
  expect(inserted.expiresAt.getTime()).toBeGreaterThan(Date.now());
});

test("findById returns null for an invalid id without querying the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  expect(await ComparisonModel.findById(db, "not-an-id")).toBeNull();
});

test("findByShareLink only matches public, unexpired comparisons", async () => {
  let filter;
  const expected = { _id: new ObjectId() };
  const db = { collection: () => ({ async findOne(f) { filter = f; return expected; } }) };

  const result = await ComparisonModel.findByShareLink(db, "abc123");
  expect(result).toBe(expected);
  expect(filter.shareLink).toBe("abc123");
  expect(filter.isPublic).toBe(true);
  expect(filter.expiresAt.$gt).toBeInstanceOf(Date);
});

test("addProperty returns null when either id is invalid", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  expect(await ComparisonModel.addProperty(db, "not-an-id", new ObjectId().toString())).toBeNull();
  expect(await ComparisonModel.addProperty(db, new ObjectId().toString(), "not-an-id")).toBeNull();
});

test("addProperty uses $addToSet to avoid duplicate entries", async () => {
  let update;
  const db = { collection: () => ({ async updateOne(_f, u) { update = u; return { modifiedCount: 1 }; } }) };
  const comparisonId = new ObjectId().toString();
  const propertyId = new ObjectId().toString();

  await ComparisonModel.addProperty(db, comparisonId, propertyId);
  expect(update.$addToSet.propertyIds).toBeInstanceOf(ObjectId);
});

test("getComparisonWithProperties returns null when the comparison is missing", async () => {
  const db = { collection: () => ({ async findOne() { return null; } }) };
  expect(await ComparisonModel.getComparisonWithProperties(db, new ObjectId().toString())).toBeNull();
});

test("cleanExpiredComparisons deletes only comparisons past their expiry", async () => {
  let filter;
  const db = { collection: () => ({ async deleteMany(f) { filter = f; return { deletedCount: 5 }; } }) };
  const result = await ComparisonModel.cleanExpiredComparisons(db);
  expect(result.deletedCount).toBe(5);
  expect(filter.expiresAt.$lt).toBeInstanceOf(Date);
});
