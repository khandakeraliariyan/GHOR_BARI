import { getDB } from "../config/db.js";

export const addReview = async (req, res) => {

    const db = getDB();

    const review = {
        ...req.body,
        reviewer: req.user.email,
        createdAt: new Date(),
    };

    await db.collection("reviews").insertOne(review);

    res.send({ success: true });

};

export const getReviews = async (req, res) => {

    const db = getDB();

    const reviews = await db
        .collection("reviews")
        .find({ targetEmail: req.params.email })
        .toArray();

    res.send(reviews);
    
};
