exports.checkBlocked = (req, res, next) => {
    if (req.user.isBlocked) {
        return res
            .status(403)
            .json({ message: "User is blocked by admin" });
    }
    next();
};
