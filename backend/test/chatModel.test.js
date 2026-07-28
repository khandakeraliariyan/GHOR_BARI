import { test, expect } from "@jest/globals";
import { ObjectId } from "mongodb";

import { buildParticipantPairKey, ConversationModel, MessageModel } from "../src/models/Chat.js";

test("participant pair keys are normalized and order-independent", () => {
  expect(buildParticipantPairKey(" B@Example.com ", "a@example.com")).toBe("a@example.com::b@example.com");
  expect(buildParticipantPairKey("a@example.com", "B@example.com")).toBe("a@example.com::b@example.com");
});

test("invalid identifiers return safe results without database calls", async () => {
  const db = { collection() { throw new Error("database should not be called"); } };
  expect(await ConversationModel.findById(db, "invalid")).toBeNull();
  expect(await ConversationModel.delete(db, "invalid")).toBeNull();
  expect(await MessageModel.findByConversationId(db, "invalid")).toEqual([]);
  expect(await MessageModel.deleteMessage(db, "invalid")).toBeNull();
});

test("findByParticipants queries with the normalized pair key", async () => {
  let query;
  const expected = { _id: new ObjectId() };
  const db = {
    collection(name) {
      expect(name).toBe("conversations");
      return { async findOne(value) { query = value; return expected; } };
    },
  };
  expect(await ConversationModel.findByParticipants(db, "B@example.com", "a@example.com")).toBe(expected);
  expect(query).toEqual({ participantPairKey: "a@example.com::b@example.com" });
});

test("updateLastMessage writes message metadata", async () => {
  const id = new ObjectId().toString();
  let update;
  const db = { collection: () => ({ async updateOne(filter, value) { update = { filter, value }; return { modifiedCount: 1 }; } }) };
  const result = await ConversationModel.updateLastMessage(db, id, "Hello", "a@example.com");
  expect(result.modifiedCount).toBe(1);
  expect(update.value.$set.lastMessage).toBe("Hello");
  expect(update.value.$set.lastMessageSender).toBe("a@example.com");
  expect(update.value.$set.updatedAt).toBeInstanceOf(Date);
});

test("creates conversations with normalized participant metadata", async () => {
  let inserted;
  const insertedId = new ObjectId();
  const db = { collection: () => ({ async insertOne(value) { inserted = value; return { insertedId }; } }) };
  expect(await ConversationModel.create(db, {
    participant1Email: "B@example.com",
    participant2Email: "a@example.com",
    propertyId: "property-1",
  })).toBe(insertedId);
  expect(inserted.participantPairKey).toBe("a@example.com::b@example.com");
  expect(inserted.propertyId).toBe("property-1");
  expect(inserted.createdAt).toBeInstanceOf(Date);
});

test("creates messages with safe attachment defaults", async () => {
  const conversationId = new ObjectId().toString();
  let inserted;
  const insertedId = new ObjectId();
  const db = { collection: () => ({ async insertOne(value) { inserted = value; return { insertedId }; } }) };
  expect(await MessageModel.create(db, {
    conversationId,
    senderEmail: "a@example.com",
    senderName: "A",
    content: "Hello",
  })).toBe(insertedId);
  expect(inserted.conversationId).toBeInstanceOf(ObjectId);
  expect(inserted.attachments).toEqual([]);
  expect(inserted.isRead).toBe(false);
});

test("marks only other users' unread messages as read", async () => {
  const conversationId = new ObjectId().toString();
  let operation;
  const db = { collection: () => ({ async updateMany(filter, update) { operation = { filter, update }; return { modifiedCount: 2 }; } }) };
  const result = await MessageModel.markAsRead(db, conversationId, "reader@example.com");
  expect(result.modifiedCount).toBe(2);
  expect(operation.filter.senderEmail).toEqual({ $ne: "reader@example.com" });
  expect(operation.filter.isRead).toBe(false);
  expect(operation.update.$set.isRead).toBe(true);
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
  expect(await MessageModel.getUnreadCount(db, "me@example.com")).toBe(3);
  expect(countFilter.senderEmail).toEqual({ $ne: "me@example.com" });
  expect(countFilter.conversationId.$in).toEqual([conversationId]);
});
