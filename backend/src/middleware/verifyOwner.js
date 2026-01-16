 export const verifyOwner = (req, res, next) => {

    const email = req.query.email;
    
    if (req.user.email !== email) {
    
        return res.status(403).send({ message: "Forbidden Access" });
    
    }
    
    next();

};
