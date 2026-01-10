import { getDatabase } from "../config/db.js";

export const verifyAdmin = async (req, res, next) => {

    const db = getDatabase();

    const email = req.user.email;

    const user = await db.collection("users").findOne({ email });

    const isAdmin = user?.role === "admin";

    if (!isAdmin) {
    
        return res.status(403).send({ message: "Forbidden Access: Admins Only" });
    
    }
    
    next();

};
