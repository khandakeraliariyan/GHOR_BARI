import { getDB } from "../config/db.js";

const verifyAdmin = async (req, res, next) => {

    const db = getDB();

    const user = await db.collection("users").findOne({ email: req.user.email });

    if (user?.role !== "admin") {

        return res.status(403).send({ message: "Admins only" });

    }

    next();
    
};

export default verifyAdmin;
