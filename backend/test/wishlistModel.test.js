import { test, expect } from "@jest/globals";
import { ObjectId } from "mongodb";

import { WishlistModel } from "../src/models/Wishlist.js";

test("add returns null for an invalid property id without touching the database", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  expect(await WishlistModel.add(db, "user@example.com", "not-an-id")).toBeNull();
});

test("add upserts a wishlist entry keyed by user and property", async () => {
  const propertyId = new ObjectId().toString();
  let filter;
  let update;
  let options;
  const db = {
    collection: () => ({
      async updateOne(f, u, o) { filter = f; update = u; options = o; return { upsertedCount: 1 }; },
    }),
  };

  const result = await WishlistModel.add(db, "user@example.com", propertyId, "great view");
  expect(result.upsertedCount).toBe(1);
  expect(filter).toEqual({ userEmail: "user@example.com", propertyId: new ObjectId(propertyId) });
  expect(update.$set.note).toBe("great view");
  expect(update.$set.createdAt).toBeInstanceOf(Date);
  expect(options).toEqual({ upsert: true });
});

test("remove returns null for an invalid property id", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  expect(await WishlistModel.remove(db, "user@example.com", "not-an-id")).toBeNull();
});

test("remove deletes the matching wishlist entry", async () => {
  const propertyId = new ObjectId().toString();
  let filter;
  const db = { collection: () => ({ async deleteOne(f) { filter = f; return { deletedCount: 1 }; } }) };

  const result = await WishlistModel.remove(db, "user@example.com", propertyId);
  expect(result.deletedCount).toBe(1);
  expect(filter).toEqual({ userEmail: "user@example.com", propertyId: new ObjectId(propertyId) });
});

test("getFullByUser merges wishlist notes onto matching properties only", async () => {
  const matchedPropertyId = new ObjectId();
  const missingPropertyId = new ObjectId();
  const createdAt = new Date();

  const db = {
    collection(name) {
      if (name === "wishlist") {
        return {
          find: () => ({
            async toArray() {
              return [
                { propertyId: matchedPropertyId, note: "nice", createdAt },
                { propertyId: missingPropertyId, note: "", createdAt },
              ];
            },
          }),
        };
      }
      return {
        find: () => ({
          async toArray() {
            return [{ _id: matchedPropertyId, title: "Sunny Flat" }];
          },
        }),
      };
    },
  };

  const results = await WishlistModel.getFullByUser(db, "user@example.com");
  expect(results).toHaveLength(1);
  expect(results[0].title).toBe("Sunny Flat");
  expect(results[0].wishlistNote).toBe("nice");
  expect(results[0].wishlistAddedAt).toBe(createdAt);
});

test("getFullByUser returns an empty array when the user has no entries", async () => {
  const db = { collection: () => ({ find: () => ({ async toArray() { return []; } }) }) };
  expect(await WishlistModel.getFullByUser(db, "user@example.com")).toEqual([]);
});
