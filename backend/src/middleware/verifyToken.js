import admin from "../config/firebase.js";

const verifyToken = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {

        return res.status(401).send({ message: "Unauthorized" });
    
    }

    const token = authHeader.split(" ")[1];

    try {
    
        const decoded = await admin.auth().verifyIdToken(token);
    
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.displayName || "User",
            photoURL: decoded.picture || "",
            isVerified: decoded.email_verified,
        };
    
        next();
    
    } catch {
    
        res.status(403).send({ message: "Invalid token" });
    
    }
};

export default verifyToken;
