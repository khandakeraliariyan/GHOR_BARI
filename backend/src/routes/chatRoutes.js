import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as chatController from "../controllers/chatController.js";


const router = express.Router();


// ========== CONVERSATION MANAGEMENT ==========

/**
 * POST /api/create-conversation
 * Create a new conversation between two users
 * @auth Required (verifyToken)
 * @body {Object} Contains propertyId and other user details
 */
router.post(
    "/create-conversation", 
    verifyToken, 
    chatController.createOrGetConversation
);


/**
 * POST /api/create-conversation-from-application
 * Create conversation from accepted application
 * Only available for deal-in-progress status
 * @auth Required (verifyToken)
 * @body {string} applicationId - Reference to accepted application
 */
router.post(
    "/create-conversation-from-application", 
    verifyToken, 
    chatController.createConversationFromApplication
);


/**
 * GET /api/conversations
 * Retrieve all conversations for the authenticated user
 * @auth Required (verifyToken)
 */
router.get(
    "/conversations", 
    verifyToken, 
    chatController.getConversations
);


// ========== MESSAGE OPERATIONS ==========

/**
 * GET /api/conversations/:conversationId/messages
 * Get all messages in a specific conversation
 * @auth Required (verifyToken)
 * @param {string} conversationId - MongoDB ObjectId of conversation
 */
router.get(
    "/conversations/:conversationId/messages", 
    verifyToken, 
    chatController.getConversationMessages
);


/**
 * POST /api/send-message
 * Send a new message in a conversation
 * @auth Required (verifyToken)
 * @body {Object} Contains conversationId, text, image (optional)
 */
router.post(
    "/send-message", 
    verifyToken, 
    chatController.sendMessage
);


/**
 * DELETE /api/message/:messageId
 * Delete a specific message
 * @auth Required (verifyToken)
 * @param {string} messageId - MongoDB ObjectId of message
 */
router.delete(
    "/message/:messageId", 
    verifyToken, 
    chatController.deleteMessage
);


// ========== UNREAD NOTIFICATIONS ==========

/**
 * GET /api/unread-count
 * Get count of unread messages for user
 * @auth Required (verifyToken)
 */
router.get(
    "/unread-count", 
    verifyToken, 
    chatController.getUnreadCount
);


// ========== CONVERSATION DELETION ==========

/**
 * DELETE /api/conversation/:conversationId
 * Delete entire conversation and all its messages
 * @auth Required (verifyToken)
 * @param {string} conversationId - MongoDB ObjectId of conversation
 */
router.delete(
    "/conversation/:conversationId", 
    verifyToken, 
    chatController.deleteConversation
);


export default router;
