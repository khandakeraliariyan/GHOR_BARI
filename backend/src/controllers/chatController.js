import { ConversationModel, MessageModel } from "../models/Chat.js";
import { getIO, getConnectedUsers } from "../config/socket.js";

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
                    otherUserVerified: otherUser?.nidVerified || false
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

export const sendMessage = async (req, res) => {
    try {
        const db = req.db;
        const { conversationId, content } = req.body;
        const userEmail = req.user.email;
        const user = await db.collection("users").findOne({ email: userEmail });

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Message content is required" });
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
            content: content.trim()
        });

        // Update conversation's last message
        await ConversationModel.updateLastMessage(db, conversationId, content, userEmail);

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

        // Also emit to sender
        io.to(recipientSocketId || "").emit("message:new", {
            conversationId,
            message
        });

        return res.status(201).json({
            message: "Message sent",
            data: message
        });

    } catch (error) {
        console.error("POST /send-message error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

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
