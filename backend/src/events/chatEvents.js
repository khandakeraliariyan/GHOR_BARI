import { getIO, getConnectedUsers } from "../config/socket.js";
import { ConversationModel, MessageModel } from "../models/Chat.js";
import { getDatabase } from "../config/db.js";

export const setupSocketEvents = () => {
    const io = getIO();

    io.on("connection", (socket) => {
        console.log(`📱 Socket connected: ${socket.userEmail}`);

        // Join chat room
        socket.on("chat:join", (conversationId) => {
            socket.join(conversationId);
            console.log(`👤 ${socket.userEmail} joined room: ${conversationId}`);
            socket.emit("chat:joined", { conversationId });
        });

        // Leave chat room
        socket.on("chat:leave", (conversationId) => {
            socket.leave(conversationId);
            console.log(`👤 ${socket.userEmail} left room: ${conversationId}`);
        });

        // Send message via socket
        socket.on("message:send", async (data) => {
            try {
                const db = getDatabase();
                const { conversationId, content } = data;
                const userEmail = socket.userEmail;

                if (!content || content.trim() === "") {
                    socket.emit("message:error", { error: "Message content is required" });
                    return;
                }

                // Verify conversation exists and user is participant
                const conversation = await ConversationModel.findById(db, conversationId);
                if (!conversation) {
                    socket.emit("message:error", { error: "Conversation not found" });
                    return;
                }

                if (conversation.participant1Email !== userEmail && conversation.participant2Email !== userEmail) {
                    socket.emit("message:error", { error: "Unauthorized" });
                    return;
                }

                // Get sender info
                const user = await db.collection("users").findOne({ email: userEmail });

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

                // Broadcast to all users in the room
                io.to(conversationId).emit("message:received", {
                    conversationId,
                    message
                });

            } catch (error) {
                console.error("Socket message:send error:", error);
                socket.emit("message:error", { error: "Failed to send message" });
            }
        });

        // Typing indicator
        socket.on("typing:start", (conversationId) => {
            socket.broadcast.to(conversationId).emit("typing:active", {
                userEmail: socket.userEmail,
                isTyping: true
            });
        });

        socket.on("typing:stop", (conversationId) => {
            socket.broadcast.to(conversationId).emit("typing:active", {
                userEmail: socket.userEmail,
                isTyping: false
            });
        });

        // Mark messages as read
        socket.on("message:markRead", async (conversationId) => {
            try {
                const db = getDatabase();
                await MessageModel.markAsRead(db, conversationId, socket.userEmail);
                io.to(conversationId).emit("message:read", { conversationId });
            } catch (error) {
                console.error("Socket message:markRead error:", error);
            }
        });

        // Get online users
        socket.on("users:getOnline", () => {
            const onlineUsers = Array.from(getConnectedUsers().keys());
            socket.emit("users:online", onlineUsers);
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log(`📴 Socket disconnected: ${socket.userEmail}`);
        });
    });
};
