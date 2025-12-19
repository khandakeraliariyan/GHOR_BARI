const User = require("../models/User");

// ADD or REMOVE Wishlist (Toggle)
exports.toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const propertyId = req.params.propertyId;

        const isWishlisted = user.wishlist.includes(propertyId);

        if (isWishlisted) {
            user.wishlist = user.wishlist.filter(
                (id) => id.toString() !== propertyId
            );
            await user.save();
            return res.json({ message: "Removed from wishlist" });
        } else {
            user.wishlist.push(propertyId);
            await user.save();
            return res.json({ message: "Added to wishlist" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET User Wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "wishlist"
        );
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
