import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";

import { buildParticipantPairKey, ConversationModel, MessageModel } from "../src/models/Chat.js";

test("participant pair keys are normalized and order-independent", () => {
  assert.equal(buildParticipantPairKey(" B@Example.com ", "a@example.com"), "a@example.com::b@example.com");
  assert.equal(buildParticipantPairKey("a@example.com", "B@example.com"), "a@example.com::b@example.com");
});

test("invalid identifiers return safe results without database calls", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  assert.equal(await ConversationModel.findById(db, "invalid"), null);
  assert.equal(await ConversationModel.delete(db, "invalid"), null);
  assert.deepEqual(await MessageModel.findByConversationId(db, "invalid"), []);
  assert.equal(await MessageModel.deleteMessage(db, "invalid"), null);
});

test("findByParticipants queries with the normalized pair key", async () => {
  let query;
  const expected = { _id: new ObjectId() };
  const db = {
    collection(name) {
      assert.equal(name, "conversations");
      return { async findOne(value) { query = value; return expected; } };
    },
  };
  assert.equal(await ConversationModel.findByParticipants(db, "B@example.com", "a@example.com"), expected);
  assert.deepEqual(query, { participantPairKey: "a@example.com::b@example.com" });
});

test("updateLastMessage writes message metadata", async () => {
  const id = new ObjectId().toString();
  let update;
  const db = { collection: () => ({ async updateOne(filter, value) { update = { filter, value }; return { modifiedCount: 1 }; } }) };
  const result = await ConversationModel.updateLastMessage(db, id, "Hello", "a@example.com");
  assert.equal(result.modifiedCount, 1);
  assert.equal(update.value.$set.lastMessage, "Hello");
  assert.equal(update.value.$set.lastMessageSender, "a@example.com");
  assert.ok(update.value.$set.updatedAt instanceof Date);
});

test("creates conversations with normalized participant metadata", async () => {
  let inserted;
  const insertedId = new ObjectId();
  const db = { collection: () => ({ async insertOne(value) { inserted = value; return { insertedId }; } }) };
  assert.equal(await ConversationModel.create(db, {
    participant1Email: "B@example.com",
    participant2Email: "a@example.com",
    propertyId: "property-1",
  }), insertedId);
  assert.equal(inserted.participantPairKey, "a@example.com::b@example.com");
  assert.equal(inserted.propertyId, "property-1");
  assert.ok(inserted.createdAt instanceof Date);
});

test("creates messages with safe attachment defaults", async () => {
  const conversationId = new ObjectId().toString();
  let inserted;
  const insertedId = new ObjectId();
  const db = { collection: () => ({ async insertOne(value) { inserted = value; return { insertedId }; } }) };
  assert.equal(await MessageModel.create(db, {
    conversationId,
    senderEmail: "a@example.com",
    senderName: "A",
    content: "Hello",
  }), insertedId);
  assert.ok(inserted.conversationId instanceof ObjectId);
  assert.deepEqual(inserted.attachments, []);
  assert.equal(inserted.isRead, false);
});

test("marks only other users' unread messages as read", async () => {
  const conversationId = new ObjectId().toString();
  let operation;
  const db = { collection: () => ({ async updateMany(filter, update) { operation = { filter, update }; return { modifiedCount: 2 }; } }) };
  const result = await MessageModel.markAsRead(db, conversationId, "reader@example.com");
  assert.equal(result.modifiedCount, 2);
  assert.deepEqual(operation.filter.senderEmail, { $ne: "reader@example.com" });
  assert.equal(operation.filter.isRead, false);
  assert.equal(operation.update.$set.isRead, true);
});

test("counts unread messages across a user's conversations", async () => {
  const conversationId = new ObjectId();
  let countFilter;
  const db = {
    collection(name) {
      if (name === "conversations") {
        return { find: () => ({ async toArray() { return [{ _id: conversationId }]; } }) };
      }
      return { async countDocuments(filter) { countFilter = filter; return 3; } };
    },
  };
  assert.equal(await MessageModel.getUnreadCount(db, "me@example.com"), 3);
  assert.deepEqual(countFilter.senderEmail, { $ne: "me@example.com" });
  assert.deepEqual(countFilter.conversationId.$in, [conversationId]);
});
