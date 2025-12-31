import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const addToWishlist = async (req, res) => {

  const db = getDB();

  await db.collection("wishlist").insertOne({

    userEmail: req.user.email,
    propertyId: new ObjectId(req.body.propertyId),
    createdAt: new Date(),

  });

  res.send({ success: true });

};

export const getWishlist = async (req, res) => {

  const db = getDB();

  const data = await db
    .collection("wishlist")
    .find({ userEmail: req.user.email })
    .toArray();

  res.send(data);
  
};
