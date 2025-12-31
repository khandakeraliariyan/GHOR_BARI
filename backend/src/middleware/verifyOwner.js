const verifyOwner = (req, res, next) => {

    if (req.user.email !== req.query.email) {

        return res.status(403).send({ message: "Forbidden Access" });
    }

    next();
    
};

export default verifyOwner;
