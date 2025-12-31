import { getDB } from "../config/db.js";

export const registerUser = async (req, res) => {

  const db = getDB();
  
  const { email, name, role, phone, profileImage } = req.body;

  if (!email || !name) {
    
    return res.status(400).send({ message: "Email & name required" });
  
}

  const exists = await db.collection("users").findOne({ email });

  if (exists) {
    
    return res.status(400).send({ message: "User exists" });
  
}

  const validRoles = ["property_owner", "property_seeker", "admin", "user"];

  await db.collection("users").insertOne({

    email,
    name,
    role: validRoles.includes(role) ? role : "user",
    phone: phone || "",
    profileImage: profileImage || "",
    nidVerified: false,
    nidImages: [],
    rating: { totalRatings: 0, ratingCount: 0, average: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),

  });

  res.status(201).send({ success: true });
  
};
