import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./ghor-bari-firebase-admin-sdk.json");

dotenv.config();

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Middlewares
app.use(cors());
app.use(express.json());

// Verify if the email in the query matches the verified token email
const verifyOwner = (req, res, next) => {
    const email = req.query.email;
    if (req.user.email !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
    }
    next();
};

// 1. Add this middleware after your verifyToken middleware
const verifyAdmin = async (req, res, next) => {
    const email = req.user.email;
    const user = await db.collection("users").findOne({ email });
    const isAdmin = user?.role === "admin";
    if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden Access: Admins Only" });
    }
    next();
};

// VERIFY FIREBASE TOKEN
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.displayName || "User",
            photoURL: decoded.picture || "",
            isVerified: decoded.email_verified || false
        };

        next();
    } catch (err) {
        return res.status(403).send({ message: "Invalid token" });
    }
};

const PORT = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function startServer() {
    try {
        await client.connect();
        db = client.db("GhorBari");
        console.log("✅ MongoDB connected");

        // Test route
        app.get("/", (req, res) => {
            res.send("🏠 GhorBari server is running");
        });

        // Register User
        app.post("/register-user", async (req, res) => {
            try {
                const { email, name, profileImage = "", phone, role } = req.body;

                if (!email || !name) return res.status(400).json({ message: "Email and name are required" });

                const validRoles = ["property_seeker", "property_owner", "user", "admin"];
                const userRole = validRoles.includes(role) ? role : "user";

                const existing = await db.collection("users").findOne({ email });
                if (existing) return res.status(400).json({ message: "User already exists" });

                const result = await db.collection("users").insertOne({
                    email,
                    name,
                    profileImage,
                    phone: phone || "",
                    role: userRole,
                    nidVerified: false,
                    nidImages: [],
                    nidSubmittedAt: null,
                    nidVerifiedAt: null,
                    rating: { totalRatings: 0, ratingCount: 0, average: 0 },
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                return res.status(201).json({ message: "User created successfully", user: result.insertedId });
            } catch (error) {
                console.error("POST /register-user error:", error);
                res.status(500).json({ message: "Server error" });
            }
        });

        // Batch fetch users by emails (comma separated), returns minimal fields
        app.get("/users-by-emails", verifyToken, async (req, res) => {
            try {
                const emailsParam = req.query.emails;
                if (!emailsParam) return res.status(400).json({ message: "emails query required" });

                const emails = emailsParam.split(",").map(e => e.trim()).filter(Boolean);
                if (emails.length === 0) return res.json([]);

                const users = await db.collection("users")
                    .find({ email: { $in: emails } }, { projection: { email: 1, nidVerified: 1, rating: 1, name: 1 } })
                    .toArray();

                return res.json(users);
            } catch (error) {
                console.error("GET /users-by-emails error:", error);
                res.status(500).json({ message: "Server error" });
            }
        });

        // Check user existence
        app.get("/check-user-exist", async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) return res.status(400).json({ message: "Email is required" });

                const user = await db.collection("users").findOne({ email });
                return res.json({ exists: !!user });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error" });
            }
        });

        // Get user role
        app.get("/get-user-role", async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) return res.status(400).json({ role: null });

                const user = await db.collection("users").findOne({ email });
                return res.json({ role: user?.role || null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ role: null });
            }
        });

        // UPDATE USER PROFILE 
        app.patch("/update-profile", verifyToken, async (req, res) => {
            try {
                const { name, phone, profileImage } = req.body;
                const email = req.user.email;

                const updatedDoc = {
                    $set: {
                        name,
                        phone,
                        profileImage,
                        updatedAt: new Date()
                    }
                };

                const result = await db.collection("users").updateOne({ email }, updatedDoc);
                res.send({ success: true, modifiedCount: result.modifiedCount });
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });

        // SUBMIT NID FOR VERIFICATION
        app.post("/submit-nid", verifyToken, async (req, res) => {
            try {
                const { nidImages } = req.body; // Expecting array of 2 URLs
                const email = req.user.email;

                const updatedDoc = {
                    $set: {
                        nidImages,
                        nidSubmittedAt: new Date(),
                        nidVerified: false // Admin will manually verify later
                    }
                };

                await db.collection("users").updateOne({ email }, updatedDoc);
                res.send({ success: true, message: "NID submitted for review" });
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });

        // GET CURRENT USER DATA
        app.get("/user-profile", verifyToken, async (req, res) => {
            try {
                const user = await db.collection("users").findOne({ email: req.user.email });
                res.send(user);
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });

        // CHECK IF USER IS ADMIN
        app.get("/users/admin/:email", verifyToken, async (req, res) => {
            try {
                const email = req.params.email;

                // Security: Only the user themselves or an existing admin should ideally call this, 
                // but for the hook, we check if the token email matches the requested email.
                if (email !== req.user.email) {
                    return res.status(403).send({ message: "Forbidden Access" });
                }

                const user = await db.collection("users").findOne({ email });
                const isAdmin = user?.role === "admin";

                res.send({ admin: isAdmin });
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });

        // GET SECURE PUBLIC PROFILE (To show owner details to seekers - kept minimal for security purpose)
        app.get("/public-profile/:email", verifyToken, async (req, res) => {
            try {
                const email = req.params.email;
                const user = await db.collection("users").findOne(
                    { email },
                    {
                        projection: {
                            name: 1,
                            email: 1,
                            profileImage: 1,
                            role: 1,
                            rating: 1,
                            createdAt: 1,
                            nidVerified: 1,
                            phone: 1
                        }
                    }
                );

                if (!user) return res.status(404).send({ message: "User not found" });
                res.send(user);
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });


        // CREATE PROPERTY
        app.post("/post-property", verifyToken, async (req, res) => {
            try {
                const data = req.body;

                const property = {
                    title: data.title,
                    listingType: data.listingType,        // rent | sale
                    propertyType: data.propertyType,      // flat | building
                    price: Number(data.price),             // sale price or rent per month
                    unitCount: Number(data.unitCount),    // bedrooms OR floors
                    bathrooms: Number(data.bathrooms),
                    areaSqFt: Number(data.areaSqFt),

                    // Address object now stores IDs + full address
                    address: {
                        division_id: data.address.division_id,
                        district_id: data.address.district_id,
                        upazila_id: data.address.upazila_id,
                        street: data.address.street
                    },

                    // Array of image URLs from ImgBB
                    images: data.images || [],

                    overview: data.overview,
                    amenities: data.amenities || [],

                    location: {
                        lat: Number(data.location.lat),
                        lng: Number(data.location.lng)
                    },

                    owner: {
                        uid: req.user.uid,
                        name: req.user.name,
                        email: req.user.email,
                        photoURL: req.user.photoURL
                    },

                    isOwnerVerified: req.user.isVerified,
                    status: "pending",
                    createdAt: new Date()
                };


                // Insert directly into the "properties" collection
                const result = await db.collection("properties").insertOne(property);
                res.status(201).send({ success: true, id: result.insertedId });

            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Server error" });
            }
        });

        // get all property data of a user
        app.get("/my-properties", verifyToken, verifyOwner, async (req, res) => {
            try {
                const email = req.query.email;
                const query = { "owner.email": email };

                // Sorting by newest first
                const result = await db.collection("properties")
                    .find(query)
                    .sort({ createdAt: -1 })
                    .toArray();

                res.send(result);
            } catch (error) {
                console.error("GET /my-properties error:", error);
                res.status(500).send({ message: "Server error" });
            }
        });

        // GET SINGLE PROPERTY BY ID
        app.get("/property/:id", verifyToken, async (req, res) => {
            try {
                const id = req.params.id;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ message: "Invalid ID format" });
                }
                const result = await db.collection("properties").findOne({ _id: new ObjectId(id) });
                if (!result) return res.status(404).send({ message: "Property not found" });
                res.send(result);
            } catch (error) {
                console.error("GET /property/:id error:", error);
                res.status(500).send({ message: "Server error" });
            }
        });

        // Get all ACTIVE property listings (requires login)
        app.get("/active-properties", verifyToken, async (req, res) => {
            try {
                const result = await db.collection("properties")
                    .find({ status: "active" })       // only show active approved listings
                    .sort({ createdAt: -1 })          // newest first
                    .toArray();

                return res.json(result);
            } catch (error) {
                console.error("GET /properties error:", error);
                res.status(500).json({ message: "Server error" });
            }
        });

        // --- ADMIN ROUTES ---

        // Get all users with pending NID submissions
        app.get("/admin/pending-verifications", verifyToken, async (req, res) => {
            const users = await db.collection("users")
                .find({ nidImages: { $exists: true, $ne: [] }, nidVerified: false })
                .sort({ nidSubmittedAt: -1 })
                .toArray();
            res.send(users);
        });

        // Update user verification status
        app.patch("/admin/verify-user/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            const { status } = req.body; // boolean
            const result = await db.collection("users").updateOne(
                { _id: new ObjectId(id) },
                { $set: { nidVerified: status, nidVerifiedAt: status ? new Date() : null } }
            );
            res.send(result);
        });

        // Get all pending property listings
        app.get("/admin/pending-properties", verifyToken, async (req, res) => {
            const properties = await db.collection("properties")
                .find({ status: "pending" })
                .sort({ createdAt: -1 })
                .toArray();
            res.send(properties);
        });

        // Update property status (Approve/Delete)
        app.patch("/admin/property-status/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            const { status } = req.body; // "active" or "deleted"
            const result = await db.collection("properties").updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: status } }
            );
            res.send(result);
        });

        // Permanently delete a property from the database
        app.delete("/admin/delete-property/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            const result = await db.collection("properties").deleteOne({
                _id: new ObjectId(id)
            });
            res.send(result);
        });

        // Dashboard Stats API
        app.get("/admin/stats", verifyToken, async (req, res) => {
            const pendingVer = await db.collection("users").countDocuments({ nidImages: { $exists: true, $ne: [] }, nidVerified: false });
            const pendingList = await db.collection("properties").countDocuments({ status: "pending" });
            const activeList = await db.collection("properties").countDocuments({ status: "active" });

            // ADD THESE TWO LINES:
            const rentedCount = await db.collection("properties").countDocuments({ status: "rented" });
            const soldCount = await db.collection("properties").countDocuments({ status: "sold" });

            // UPDATE THE SEND OBJECT:
            res.send({
                pendingVer,
                pendingList,
                activeList,
                rentedCount,
                soldCount
            });
        });

        // api for admin to get property by id regardless of status
        app.get('/admin/property/:id', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ message: "Invalid ID format" });
                }

                // Use db.collection("properties") because "propertyCollection" is not defined in your script
                const result = await db.collection("properties").findOne({ _id: new ObjectId(id) });

                if (!result) return res.status(404).send({ message: "Property not found" });
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });




        app.listen(PORT, () => {
            console.log(`🏠 GhorBari server is running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
