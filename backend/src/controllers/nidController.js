import { getDB } from "../config/db.js";

export const submitNID = async (req, res) => {

    const db = getDB();

    const { nidImages } = req.body;

    await db.collection("users").updateOne(

        { email: req.user.email },

        {
            $set: {
                nidImages,
                nidSubmittedAt: new Date(),
                nidVerified: false,
            },
        }

    );

    res.send({ success: true });

};
