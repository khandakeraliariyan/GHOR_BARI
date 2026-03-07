import { getDatabase } from "../config/db.js";


/**
 * Middleware to verify admin role
 * Must be used after verifyToken middleware
 */
export const verifyAdmin = async (req, res, next) => {

    const db = getDatabase();
    const email = req.user.email;


    // Fetch user from database
    const user = await db.collection("users").findOne({ email });

    // Check if user has admin role
    const isAdmin = user?.role === "admin";

    if (!isAdmin) {

        return res.status(403).send({ message: "Forbidden Access: Admins Only" });

    }

    // User is admin, proceed
    next();

};
