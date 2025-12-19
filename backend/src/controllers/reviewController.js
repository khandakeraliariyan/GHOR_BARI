const Review = require("../models/Review");
const User = require("../models/User");

// Add review
exports.addReview = async (req, res) => {
    try {
        const { targetUser, rating, comment } = req.body;

        if (targetUser === req.user._id.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot rate yourself" });
        }

        const review = await Review.create({
            reviewer: req.user._id,
            targetUser,
            rating,
            comment,
        });

        // Recalculate average rating
        const reviews = await Review.find({ targetUser });
        const avgRating =
            reviews.reduce((sum, r) => sum + r.rating, 0) /
            reviews.length;

        await User.findByIdAndUpdate(targetUser, {
            rating: avgRating.toFixed(1),
        });

        res.status(201).json({
            message: "Review added successfully",
            review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews of a user
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            targetUser: req.params.userId,
        }).populate("reviewer", "name");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
