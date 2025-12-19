const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "seeker", "admin"],
            default: "seeker",
        },
        nidNumber: {
            type: String,
        },
        nidImage: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 0,
        },
        nidStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property",
            },
        ],
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
