const Message = require("../models/Message");

// Get chat history between two users
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id },
            ],
        })
            .sort({ createdAt: 1 })
            .populate("sender receiver", "name");

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
