import { test, expect } from "@jest/globals";

import { EmailJobModel } from "../src/models/EmailJob.js";

test("markSent flags the job as sent and clears the last error", async () => {
  let filter;
  let update;
  const db = { collection: () => ({ async updateOne(f, u) { filter = f; update = u; return { modifiedCount: 1 }; } }) };

  const result = await EmailJobModel.markSent(db, "job-1");
  expect(result.modifiedCount).toBe(1);
  expect(filter).toEqual({ _id: "job-1" });
  expect(update.$set.status).toBe("sent");
  expect(update.$set.lastError).toBeNull();
  expect(update.$set.sentAt).toBeInstanceOf(Date);
});

test("markForRetry re-queues the job as pending when attempts remain", async () => {
  let update;
  const db = { collection: () => ({ async updateOne(_f, u) { update = u; } }) };
  const nextRunAt = new Date();

  await EmailJobModel.markForRetry(db, "job-1", 2, 5, nextRunAt, "SMTP timeout");
  expect(update.$set.status).toBe("pending");
  expect(update.$set.attempts).toBe(2);
  expect(update.$set.nextRunAt).toBe(nextRunAt);
  expect(update.$set.lastError).toBe("SMTP timeout");
});

test("markForRetry marks the job failed once attempts reach the max", async () => {
  let update;
  const db = { collection: () => ({ async updateOne(_f, u) { update = u; } }) };

  await EmailJobModel.markForRetry(db, "job-1", 5, 5, new Date(), "Permanent failure");
  expect(update.$set.status).toBe("failed");
});

test("claimDueJobs only returns candidates it successfully transitions to processing", async () => {
  const candidateA = { _id: "a", status: "pending" };
  const candidateB = { _id: "b", status: "pending" };
  const claimedDocs = { a: { _id: "a", status: "processing" } };

  const db = {
    collection: () => ({
      find: () => ({
        sort: () => ({
          limit: () => ({ async toArray() { return [candidateA, candidateB]; } }),
        }),
      }),
      async updateOne(filter) {
        return { modifiedCount: filter._id === "a" ? 1 : 0 };
      },
      async findOne(filter) {
        return claimedDocs[filter._id] || null;
      },
    }),
  };

  const claimed = await EmailJobModel.claimDueJobs(db, 10);
  expect(claimed).toEqual([{ _id: "a", status: "processing" }]);
});

test("requeueStaleProcessingJobs resets stale jobs back to pending", async () => {
  let filter;
  let update;
  const db = { collection: () => ({ async updateMany(f, u) { filter = f; update = u; return { modifiedCount: 3 }; } }) };
  const staleBefore = new Date();

  const result = await EmailJobModel.requeueStaleProcessingJobs(db, staleBefore);
  expect(result.modifiedCount).toBe(3);
  expect(filter.status).toBe("processing");
  expect(filter.updatedAt.$lt).toBe(staleBefore);
  expect(update.$set.status).toBe("pending");
});
