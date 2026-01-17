import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as chatController from "../controllers/chatController.js";

const router = express.Router();

// Create or get conversation
router.post("/create-conversation", verifyToken, chatController.createOrGetConversation);

// Get all conversations for logged-in user
router.get("/conversations", verifyToken, chatController.getConversations);

// Get messages in a conversation
router.get("/conversations/:conversationId/messages", verifyToken, chatController.getConversationMessages);

// Send a message
router.post("/send-message", verifyToken, chatController.sendMessage);

// Get unread message count
router.get("/unread-count", verifyToken, chatController.getUnreadCount);

// Delete a message
router.delete("/message/:messageId", verifyToken, chatController.deleteMessage);

// Delete entire conversation
router.delete("/conversation/:conversationId", verifyToken, chatController.deleteConversation);

export default router;
