import { test, expect } from "@jest/globals";
import { ObjectId } from "mongodb";

import { RatingModel } from "../src/models/Rating.js";

test("upsert writes a normalized score and preserves createdAt only on insert", async () => {
  const applicationId = new ObjectId();
  const propertyId = new ObjectId();
  let filter;
  let update;
  let options;
  const savedDoc = { _id: new ObjectId() };

  const db = {
    collection: () => ({
      async updateOne(f, u, o) { filter = f; update = u; options = o; return { upsertedCount: 1 }; },
      async findOne() { return savedDoc; },
    }),
  };

  const result = await RatingModel.upsert(db, {
    applicationId,
    propertyId,
    raterEmail: "rater@example.com",
    rateeEmail: "ratee@example.com",
    score: "4",
    review: "Great tenant",
    roleContext: "owner",
  });

  expect(result).toBe(savedDoc);
  expect(filter).toEqual({ applicationId, raterEmail: "rater@example.com" });
  expect(update.$set.score).toBe(4);
  expect(update.$set.review).toBe("Great tenant");
  expect(update.$setOnInsert.createdAt).toBeInstanceOf(Date);
  expect(options).toEqual({ upsert: true });
});

test("upsert converts string ids to ObjectId instances", async () => {
  const applicationId = new ObjectId().toString();
  const propertyId = new ObjectId().toString();
  let filter;
  let setPayload;
  const db = {
    collection: () => ({
      async updateOne(f, u) { filter = f; setPayload = u.$set; },
      async findOne() { return null; },
    }),
  };

  await RatingModel.upsert(db, { applicationId, propertyId, raterEmail: "a@example.com", rateeEmail: "b@example.com", score: 5 });
  expect(filter.applicationId).toBeInstanceOf(ObjectId);
  expect(setPayload.propertyId).toBeInstanceOf(ObjectId);
});

test("upsert defaults a missing review to an empty string", async () => {
  let setPayload;
  const db = {
    collection: () => ({
      async updateOne(f, u) { setPayload = u.$set; },
      async findOne() { return null; },
    }),
  };

  await RatingModel.upsert(db, { applicationId: new ObjectId(), propertyId: new ObjectId(), raterEmail: "a@example.com", rateeEmail: "b@example.com", score: 3 });
  expect(setPayload.review).toBe("");
});

test("getAggregateForRatee returns zeroed stats when there are no ratings", async () => {
  const db = { collection: () => ({ aggregate: () => ({ async toArray() { return []; } }) }) };
  expect(await RatingModel.getAggregateForRatee(db, "ratee@example.com")).toEqual({
    totalRatings: 0,
    ratingCount: 0,
    average: 0,
  });
});

test("getAggregateForRatee rounds the average to two decimal places", async () => {
  const db = {
    collection: () => ({
      aggregate: () => ({ async toArray() { return [{ totalRatings: 10, ratingCount: 3, average: 3.3333333 }]; } }),
    }),
  };
  expect(await RatingModel.getAggregateForRatee(db, "ratee@example.com")).toEqual({
    totalRatings: 10,
    ratingCount: 3,
    average: 3.33,
  });
});
