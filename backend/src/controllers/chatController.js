import { ObjectId } from "mongodb";
import { ConversationModel, MessageModel } from "../models/Chat.js";
import { getIO, getConnectedUsers } from "../config/socket.js";


// ========== CHAT CONTROLLER ==========

/**
 * Real-time Messaging System
 * 
 * Manages communication between property owner and seeker
 * Features:
 * - Only available after deal-in-progress (offer accepted)
 * - Real-time socket and REST API support
 * - Conversation and message persistence
 * - Read status tracking
 * - Message attachments support
 * - Unread count tracking
 * 
 * Access Control:
 * - Chat only allowed for deal-in-progress applications
 * - Both participants can message each other
 * - Cannot start chat for properties without active deals
 */


// ========== HELPER FUNCTIONS ==========

/**
 * Verify deal-in-progress exists for chat authorization
 * 
 * Ensures chat is only allowed when transaction is in progress
 * Validates both participants are involved in deal
 * 
 * @param {Database} db - MongoDB database reference
 * @param {string} userEmail - Current user email
 * @param {string} otherUserEmail - Other participant email
 * @param {string|ObjectId} propertyId - Property ID
 * 
 * @returns {Promise<boolean>} true if deal-in-progress exists, false otherwise
 */
async function ensureDealInProgressForChat(db, userEmail, otherUserEmail, propertyId) {
    if (!propertyId) return true;
    const propId = typeof propertyId === "string" ? new ObjectId(propertyId) : propertyId;
    const application = await db.collection("applications").findOne({
        propertyId: propId,
        status: "deal-in-progress",
        $or: [
            { "seeker.email": userEmail, "owner.email": otherUserEmail },
            { "seeker.email": otherUserEmail, "owner.email": userEmail }
        ]
    });
    return !!application;
}

// ========== CONVERSATION CREATION & RETRIEVAL ==========

/**
 * Create or get conversation
 * 
 * POST /api/chat/conversations
 * 
 * Initiates chat between two users for a property deal
 * Only works if deal-in-progress status exists for that property
 * Creates conversation if doesn't exist, returns existing if does
 * 
 * @param {Object} req.body
 * @param {string} req.body.otherUserEmail - Email of conversation participant (required)
 * @param {string} req.body.propertyId - Property ID for deal (required)
 * 
 * @returns {200} Conversation created or retrieved
 * @returns {200.conversation} Conversation object with participant details
 * 
 * @returns {400} Missing required fields / Self-conversation attempt
 * @returns {403} No deal-in-progress for this property
 * @returns {404} Other user not found
 * @returns {500} Database error
 * 
 * @auth Required (authenticated participant)
 * 
 * Access Control:
 * - Both participants must be involved in deal-in-progress
 * - Cannot chat with self
 * - propertyId required to verify deal exists
 */
export const createOrGetConversation = async (req, res) => {
    try {
        const db = req.db;
        const { otherUserEmail, propertyId } = req.body;
        const userEmail = req.user.email;

        if (!otherUserEmail) {
            return res.status(400).json({ message: "Other user email is required" });
        }

        if (userEmail === otherUserEmail) {
            return res.status(400).json({ message: "Cannot start conversation with yourself" });
        }

        // Chat is only allowed after offer or counter offer is accepted (deal-in-progress)
        if (!propertyId) {
            return res.status(400).json({
                message: "Chat is only available after a deal is accepted. Accept an offer or counter offer in property bidding to start chatting."
            });
        }
        const allowed = await ensureDealInProgressForChat(db, userEmail, otherUserEmail, propertyId);
        if (!allowed) {
            return res.status(403).json({
                message: "Chat is only available after a deal is accepted (deal-in-progress) for this property."
            });
        }

        // Check if other user exists
        const otherUser = await db.collection("users").findOne({ email: otherUserEmail });
        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const conversation = await ConversationModel.findOrCreate(db, userEmail, otherUserEmail, propertyId);

        return res.status(200).json({
            message: "Conversation created or retrieved",
            conversation
        });

    } catch (error) {
        console.error("POST /create-conversation error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Create conversation from application ID
 * 
 * POST /api/chat/conversations/from-application
 * 
 * Creates conversation directly from application deal
 * Automatically verifies user is participant of deal
 * Required when initiating chat from application UI
 * 
 * @param {Object} req.body
 * @param {string} req.body.applicationId - Application document ID (required)
 * 
 * @returns {200} Conversation created/retrieved with enriched participant info
 * @returns {200.conversation} Enriched conversation object
 * @returns {200.conversation.otherUserName} Other participant name
 * @returns {200.conversation.otherUserImage} Other participant photo
 * @returns {200.conversation.otherUserVerified} NID verification status
 * 
 * @returns {400} Missing applicationId / Invalid application
 * @returns {403} User not part of application / Deal not in progress
 * @returns {404} Application not found
 * @returns {500} Database error
 * 
 * @auth Required (application participant)
 * 
 * Enrichment:
 * - Returns full participant profile information
 * - Includes verification status and profile images
 * - Validates deal-in-progress status
 */
export const createConversationFromApplication = async (req, res) => {
    try {
        const db = req.db;
        const { applicationId } = req.body;
        const userEmail = req.user.email;

        if (!applicationId) {
            return res.status(400).json({ message: "Application ID is required" });
        }

        const appId = typeof applicationId === "string" ? new ObjectId(applicationId) : applicationId;
        const application = await db.collection("applications").findOne({ _id: appId });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status !== "deal-in-progress" && application.status !== "accepted") {
            return res.status(403).json({
                message: "Chat is only available for accepted deals (deal-in-progress)."
            });
        }

        const ownerEmail = application.owner?.email;
        const seekerEmail = application.seeker?.email;
        if (!ownerEmail || !seekerEmail) {
            return res.status(400).json({ message: "Invalid application: missing owner or seeker" });
        }

        if (userEmail !== ownerEmail && userEmail !== seekerEmail) {
            return res.status(403).json({ message: "You are not part of this application" });
        }

        const otherUserEmail = userEmail === ownerEmail ? seekerEmail : ownerEmail;
        const propertyId = application.propertyId?.toString?.() || application.propertyId;

        const conversation = await ConversationModel.findOrCreate(db, userEmail, otherUserEmail, propertyId);

        const otherUser = await db.collection("users").findOne(
            { email: otherUserEmail },
            { projection: { name: 1, profileImage: 1, nidVerified: 1 } }
        );

        const enriched = {
            ...conversation,
            _id: conversation._id.toString(),
            otherUserEmail,
            otherUserName: otherUser?.name || "Unknown",
            otherUserImage: otherUser?.profileImage || null,
            otherUserVerified: otherUser?.nidVerified === "verified"
        };

        return res.status(200).json({
            message: "Conversation created or retrieved",
            conversation: enriched
        });

    } catch (error) {
        console.error("POST /create-conversation-from-application error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ========== MESSAGE OPERATIONS ==========

/**
 * Get all conversations for user
 * 
 * GET /api/chat/conversations
 * 
 * Lists all active conversations for authenticated user
 * Includes enriched participant information
 * Shows latest message preview and timestamp
 * 
 * @returns {200} Array of user's conversations
 * @returns {200[].otherUserName} Other participant name
 * @returns {200[].otherUserImage} Other participant profile photo
 * @returns {200[].otherUserVerified} NID verification status
 * @returns {200[].lastMessage, lastMessageAt} Latest message info
 * 
 * @returns {500} Database error
 * 
 * @auth Required (authenticated user)
 * 
 * @example
 * Response: [
 *   { _id, otherUserEmail, otherUserName, otherUserVerified, lastMessage, ... },
 *   ...
 * ]
 */
export const getConversations = async (req, res) => {
    try {
        const db = req.db;
        const userEmail = req.user.email;

        const conversations = await ConversationModel.findByUserEmail(db, userEmail);

        // Enrich conversations with user data
        const enrichedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserEmail = conv.participant1Email === userEmail 
                    ? conv.participant2Email 
                    : conv.participant1Email;

                const otherUser = await db.collection("users").findOne(
                    { email: otherUserEmail },
                    { projection: { name: 1, profileImage: 1, nidVerified: 1 } }
                );

                return {
                    ...conv,
                    otherUserEmail,
                    otherUserName: otherUser?.name || "Unknown",
                    otherUserImage: otherUser?.profileImage || null,
                    otherUserVerified: otherUser?.nidVerified === "verified"
                };
            })
        );

        return res.status(200).json({
            message: "Conversations retrieved",
            conversations: enrichedConversations
        });

    } catch (error) {
        console.error("GET /conversations error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get conversation messages
 * 
 * GET /api/chat/conversations/:conversationId/messages
 * 
 * Retrieves messages from conversation with pagination
 * Automatically marks messages as read for current user
 * Supports skip/limit for efficient pagination
 * 
 * @param {string} req.params.conversationId - Conversation ID
 * @query {number} skip - Messages to skip (default: 0)
 * @query {number} limit - Max messages to return (default: 50)
 * 
 * @returns {200} Messages array
 * @returns {200.messages} Array of message objects
 * @returns {200.total} Count of returned messages
 * 
 * @returns {403} Unauthorized (not conversation participant)
 * @returns {404} Conversation not found
 * @returns {500} Database error
 * 
 * @auth Required (conversation participant)
 * 
 * Side Effects:
 * - Marks all conversation's messages as read for current user
 * - Updates lastReadAt timestamp
 * 
 * @example
 * GET /api/chat/conversations/507f.../messages?skip=0&limit=50
 */
export const getConversationMessages = async (req, res) => {
    try {
        const db = req.db;
        const { conversationId } = req.params;
        const { skip = 0, limit = 50 } = req.query;
        const userEmail = req.user.email;

        // Verify user is part of this conversation
        const conversation = await ConversationModel.findById(db, conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.participant1Email !== userEmail && conversation.participant2Email !== userEmail) {
            return res.status(403).json({ message: "Unauthorized access to conversation" });
        }

        // Mark messages as read
        await MessageModel.markAsRead(db, conversationId, userEmail);

        const messages = await MessageModel.findByConversationId(
            db,
            conversationId,
            parseInt(limit),
            parseInt(skip)
        );

        return res.status(200).json({
            message: "Messages retrieved",
            messages,
            total: messages.length
        });

    } catch (error) {
        console.error("GET /conversations/:conversationId/messages error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Send message
 * 
 * POST /api/chat/messages
 * 
 * Sends message in conversation with real-time Socket.io delivery
 * Supports text content, attachments, or both
 * Automatically notifies other participant via websocket
 * Updates conversation's lastMessage preview
 * 
 * @param {Object} req.body
 * @param {string} req.body.conversationId - Conversation ID (required)
 * @param {string} req.body.content - Message text (optional if attachments)
 * @param {Array} req.body.attachments - File attachments (optional if content)
 * 
 * @returns {201} Message sent successfully
 * @returns {201.data} Created message object with _id, timestamp
 * 
 * @returns {400} Missing conversationId / Empty message (no content/attachments)
 * @returns {403} Unauthorized (not conversation participant)
 * @returns {404} Conversation not found
 * @returns {500} Database/socket error
 * 
 * @auth Required (conversation participant)
 * 
 * Real-time Delivery:
 * - Emits 'message:received' via Socket.io to other participant
 * - Includes conversationId and full message object
 * - Fails gracefully if recipient offline (message still persisted)
 * 
 * @example
 * POST /api/chat/messages
 * {
 *   "conversationId": "507f...",
 *   "content": "When can we meet to view the property?",
 *   "attachments": []
 * }
 * 
 * Response: { "message": "Message sent", "data": { _id, senderEmail, content, ... } }
 */
export const sendMessage = async (req, res) => {
    try {
        const db = req.db;
        const { conversationId, content, attachments = [] } = req.body;
        const userEmail = req.user.email;
        const user = await db.collection("users").findOne({ email: userEmail });

        const hasText = content && typeof content === "string" && content.trim() !== "";
        const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

        if (!hasText && !hasAttachments) {
            return res.status(400).json({ message: "Message content or attachment is required" });
        }

        // Verify user is part of this conversation
        const conversation = await ConversationModel.findById(db, conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.participant1Email !== userEmail && conversation.participant2Email !== userEmail) {
            return res.status(403).json({ message: "Unauthorized access to conversation" });
        }

        const otherUserEmail = conversation.participant1Email === userEmail 
            ? conversation.participant2Email 
            : conversation.participant1Email;

        // Create message
        const messageId = await MessageModel.create(db, {
            conversationId,
            senderEmail: userEmail,
            senderName: user?.name || "Unknown",
            senderImage: user?.profileImage || null,
            content: hasText ? content.trim() : "",
            attachments: hasAttachments ? attachments : []
        });

        // Update conversation's last message (prefer text; if only attachment, show a short label)
        const lastMessagePreview = hasText
            ? content
            : "[Attachment]";
        await ConversationModel.updateLastMessage(db, conversationId, lastMessagePreview, userEmail);

        const message = await db.collection("messages").findOne({ _id: messageId });

        // Emit via Socket.io to the other user
        const io = getIO();
        const connectedUsers = getConnectedUsers();
        const recipientSocketId = connectedUsers.get(otherUserEmail);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("message:received", {
                conversationId,
                message
            });
        }

        return res.status(201).json({
            message: "Message sent",
            data: message
        });

    } catch (error) {
        console.error("POST /send-message error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get unread message count
 * 
 * GET /api/chat/unread-count
 * 
 * Returns count of unread messages across all conversations
 * Used for notification badge in UI
 * Counts messages not yet read by current user
 * 
 * @returns {200} Unread count
 * @returns {200.unreadCount} Total unread messages
 * 
 * @returns {500} Database error
 * 
 * @auth Required (authenticated user)
 * 
 * @example
 * GET /api/chat/unread-count
 * Response: { "message": "Unread count retrieved", "unreadCount": 3 }
 */
export const getUnreadCount = async (req, res) => {
    try {
        const db = req.db;
        const userEmail = req.user.email;

        const unreadCount = await MessageModel.getUnreadCount(db, userEmail);

        return res.status(200).json({
            message: "Unread count retrieved",
            unreadCount
        });

    } catch (error) {
        console.error("GET /unread-count error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Delete message
 * 
 * DELETE /api/chat/messages/:messageId
 * 
 * Sender deletes their message from conversation
 * Only message sender can delete the message
 * Permanently removes message from database
 * 
 * @param {string} req.params.messageId - Message ID to delete
 * 
 * @returns {200} Message deleted successfully
 * 
 * @returns {403} Not message sender (cannot delete others' messages)
 * @returns {404} Message not found
 * @returns {500} Database error
 * 
 * @auth Required (message sender)
 * 
 * Restrictions:
 * - User can only delete own messages
 * - Permanent deletion (no recovery)
 * - Does not update conversation's lastMessage
 * 
 * @example
 * DELETE /api/chat/messages/507f1f77bcf86cd799439011
 * Response: { "message": "Message deleted" }
 */
export const deleteMessage = async (req, res) => {
    try {
        const db = req.db;
        const { messageId } = req.params;
        const userEmail = req.user.email;

        // Verify message ownership
        const message = await db.collection("messages").findOne({ _id: messageId });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.senderEmail !== userEmail) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        await MessageModel.deleteMessage(db, messageId);

        return res.status(200).json({ message: "Message deleted" });

    } catch (error) {
        console.error("DELETE /message/:messageId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Delete conversation
 * 
 * DELETE /api/chat/conversations/:conversationId
 * 
 * Participant deletes entire conversation and all messages
 * Only participants can delete the conversation
 * Permanently removes conversation and all associated messages
 * Other participant can still see conversation until they delete
 * 
 * @param {string} req.params.conversationId - Conversation ID to delete
 * 
 * @returns {200} Conversation deleted successfully
 * 
 * @returns {403} Unauthorized (not conversation participant)
 * @returns {404} Conversation not found
 * @returns {500} Database error
 * 
 * @auth Required (conversation participant)
 * 
 * Restrictions:
 * - Only conversation participants can delete
 * - Deletes all messages in conversation
 * - Permanent deletion (no recovery)
 * - Does not affect other participant's copy
 * 
 * @example
 * DELETE /api/chat/conversations/507f1f77bcf86cd799439011
 * Response: { "message": "Conversation deleted" }
 */
export const deleteConversation = async (req, res) => {
    try {
        const db = req.db;
        const { conversationId } = req.params;
        const userEmail = req.user.email;

        const conversation = await ConversationModel.findById(db, conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.participant1Email !== userEmail && conversation.participant2Email !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Delete all messages in the conversation
        await db.collection("messages").deleteMany({
            conversationId
        });

        // Delete conversation
        await ConversationModel.delete(db, conversationId);

        return res.status(200).json({ message: "Conversation deleted" });

    } catch (error) {
        console.error("DELETE /conversation/:conversationId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
