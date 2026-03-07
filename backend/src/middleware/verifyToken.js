import admin from "../config/firebase.js";
import { getDatabase } from "../config/db.js";


/**
 * Middleware to verify Firebase ID token
 * Attaches user information to request object
 */
export const verifyToken = async (req, res, next) => {

    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized" });
    }


    // Extract token from header
    const token = authHeader.split(" ")[1];


    try {

        // Verify Firebase ID token
        const decoded = await admin.auth().verifyIdToken(token);

        // Attach user information to request
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.displayName || "User",
            photoURL: decoded.picture || "",
            isVerified: decoded.email_verified || false
        };

        // Attach database to request
        req.db = getDatabase();

        next();

    } catch (err) {

        return res.status(403).send({ message: "Invalid token" });

    }

};
