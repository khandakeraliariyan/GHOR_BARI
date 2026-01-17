import { ObjectId } from "mongodb";

export class ConversationModel {
    static async create(db, conversationData) {
        const result = await db.collection("conversations").insertOne({
            participant1Email: conversationData.participant1Email,
            participant2Email: conversationData.participant2Email,
            propertyId: conversationData.propertyId || null,
            lastMessage: null,
            lastMessageTime: null,
            lastMessageSender: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return result.insertedId;
    }

    static async findById(db, conversationId) {
        if (!ObjectId.isValid(conversationId)) return null;
        return await db.collection("conversations").findOne({
            _id: new ObjectId(conversationId)
        });
    }

    static async findByParticipants(db, email1, email2) {
        return await db.collection("conversations").findOne({
            $or: [
                { participant1Email: email1, participant2Email: email2 },
                { participant1Email: email2, participant2Email: email1 }
            ]
        });
    }

    static async findByUserEmail(db, userEmail) {
        return await db.collection("conversations")
            .find({
                $or: [
                    { participant1Email: userEmail },
                    { participant2Email: userEmail }
                ]
            })
            .sort({ lastMessageTime: -1 })
            .toArray();
    }

    static async updateLastMessage(db, conversationId, messageContent, senderEmail) {
        if (!ObjectId.isValid(conversationId)) return null;
        return await db.collection("conversations").updateOne(
            { _id: new ObjectId(conversationId) },
            {
                $set: {
                    lastMessage: messageContent,
                    lastMessageTime: new Date(),
                    lastMessageSender: senderEmail,
                    updatedAt: new Date()
                }
            }
        );
    }

    static async delete(db, conversationId) {
        if (!ObjectId.isValid(conversationId)) return null;
        return await db.collection("conversations").deleteOne({
            _id: new ObjectId(conversationId)
        });
    }

    static async findOrCreate(db, email1, email2, propertyId = null) {
        let conversation = await this.findByParticipants(db, email1, email2);
        
        if (!conversation) {
            const convId = await this.create(db, {
                participant1Email: email1,
                participant2Email: email2,
                propertyId
            });
            conversation = await this.findById(db, convId);
        }
        
        return conversation;
    }
}

export class MessageModel {
    static async create(db, messageData) {
        const result = await db.collection("messages").insertOne({
            conversationId: messageData.conversationId,
            senderEmail: messageData.senderEmail,
            senderName: messageData.senderName,
            senderImage: messageData.senderImage || null,
            content: messageData.content,
            attachments: messageData.attachments || [],
            isRead: false,
            readAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return result.insertedId;
    }

    static async findByConversationId(db, conversationId, limit = 50, skip = 0) {
        if (!ObjectId.isValid(conversationId)) return [];
        
        return await db.collection("messages")
            .find({ conversationId: new ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray()
            .then(messages => messages.reverse()); // Reverse to show oldest first
    }

    static async markAsRead(db, conversationId, readerEmail) {
        if (!ObjectId.isValid(conversationId)) return null;
        
        return await db.collection("messages").updateMany(
            {
                conversationId: new ObjectId(conversationId),
                senderEmail: { $ne: readerEmail },
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
    }

    static async getUnreadCount(db, userEmail) {
        const userConversations = await db.collection("conversations")
            .find({
                $or: [
                    { participant1Email: userEmail },
                    { participant2Email: userEmail }
                ]
            })
            .toArray();

        const conversationIds = userConversations.map(c => new ObjectId(c._id));

        const unreadCount = await db.collection("messages").countDocuments({
            conversationId: { $in: conversationIds },
            senderEmail: { $ne: userEmail },
            isRead: false
        });

        return unreadCount;
    }

    static async deleteMessage(db, messageId) {
        if (!ObjectId.isValid(messageId)) return null;
        return await db.collection("messages").deleteOne({
            _id: new ObjectId(messageId)
        });
    }

    static async updateMessage(db, messageId, content) {
        if (!ObjectId.isValid(messageId)) return null;
        return await db.collection("messages").updateOne(
            { _id: new ObjectId(messageId) },
            {
                $set: {
                    content,
                    updatedAt: new Date()
                }
            }
        );
    }
}
