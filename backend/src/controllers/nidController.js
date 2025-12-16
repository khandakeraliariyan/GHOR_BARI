const User = require("../models/User");

// Submit NID (User)
exports.submitNID = async (req, res) => {
    try {
        const { nidNumber, nidImage } = req.body;

        if (!nidNumber || !nidImage) {
            return res.status(400).json({ message: "NID information required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                nidNumber,
                nidImage,
                nidStatus: "pending",
                isVerified: false,
            },
            { new: true }
        );

        res.json({
            message: "NID submitted successfully. Waiting for admin approval.",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get pending NIDs
exports.getPendingNIDs = async (req, res) => {
    try {
        const users = await User.find({ nidStatus: "pending" }).select(
            "-password"
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Approve or Reject NID
exports.updateNIDStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                nidStatus: status,
                isVerified: status === "approved",
            },
            { new: true }
        );

        res.json({
            message: `NID ${status} successfully`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
