# 🚀 Backend - Ghor Bari Server Documentation

Comprehensive documentation for the Ghor Bari backend server built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Database](#database)
- [Authentication](#authentication)
- [Real-Time Features](#real-time-features)
- [Services](#services)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## 🎯 Overview

The Ghor Bari backend is a Node.js/Express server that provides RESTful APIs and real-time communication for the property platform. It handles user authentication, property management, chat functionality, and admin operations.

### Key Features

- **RESTful API**: Clean, well-documented endpoints
- **Real-Time Chat**: Socket.io for instant messaging
- **User Authentication**: Firebase-based auth
- **AI Integration**: Groq API for descriptions
- **Email Service**: Nodemailer for notifications
- **Admin Dashboard**: Comprehensive management
- **Database**: MongoDB for data persistence
- **Security**: Role-based access control
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging system

---

## 🛠️ Tech Stack

| Component             | Technology     | Version | Purpose                    |
| --------------------- | -------------- | ------- | -------------------------- |
| **Runtime**           | Node.js        | 18+ LTS | JavaScript runtime         |
| **Framework**         | Express.js     | 5.2.1   | Web server framework       |
| **Database**          | MongoDB        | 6.x+    | NoSQL database             |
| **Database Driver**   | Mongoose       | 9.0.1   | MongoDB ODM                |
| **Auth**              | Firebase Admin | 13.7.0  | Server-side authentication |
| **Real-Time**         | Socket.io      | 4.8.1   | WebSocket communication    |
| **Email**             | Nodemailer     | 8.0.1   | Email sending              |
| **Task Scheduling**   | Node-cron      | 4.2.1   | Scheduled jobs             |
| **HTTP Client**       | Axios          | 1.7.7   | External API calls         |
| **Password Security** | Bcryptjs       | 3.0.3   | Password hashing           |
| **CORS**              | cors           | 2.8.5   | Cross-origin requests      |
| **Environment**       | dotenv         | 17.2.3  | Environment variables      |
| **Logging**           | Custom Logger  | -       | Structured logging         |

---

## 📁 Project Structure

```
backend/
├── 📁 src/
│   ├── 📄 app.js                           # Express app setup
│   │
│   ├── 📁 config/                          # Configuration
│   │   ├── 📄 db.js                        # MongoDB connection
│   │   ├── 📄 environment.js               # Environment config [NEW]
│   │   ├── 📄 constants.js                 # App constants [NEW]
│   │   ├── 📄 firebase.js                  # Firebase admin setup
│   │   └── 📄 socket.js                    # Socket.io setup
│   │
│   ├── 📁 middleware/                      # Express middleware
│   │   ├── 📄 errorMiddleware.js           # Error handling [NEW]
│   │   ├── 📄 verifyToken.js               # JWT verification [REFACTORED]
│   │   ├── 📄 verifyAdmin.js               # Admin check [REFACTORED]
│   │   ├── 📄 verifyOwner.js               # Owner verification [REFACTORED]
│   │   └── 📄 verifyPropertyOwner.js       # Property owner check [REFACTORED]
│   │
│   ├── 📁 controllers/                     # Business logic
│   │   ├── 📄 userController.js            # User operations [REFACTORED]
│   │   ├── 📄 propertyController.js        # Property operations
│   │   ├── 📄 adminController.js           # Admin operations
│   │   ├── 📄 chatController.js            # Chat operations
│   │   ├── 📄 applicationController.js     # Applications management
│   │   ├── 📄 comparisonController.js      # Property comparison
│   │   ├── 📄 ratingController.js          # Ratings system
│   │   ├── 📄 statsController.js           # Statistics
│   │   ├── 📄 aiController.js              # AI operations
│   │   └── 📄 wishlistController.js        # Wishlist management
│   │
│   ├── 📁 routes/                          # API route definitions
│   │   ├── 📄 userRoutes.js                # /api/users
│   │   ├── 📄 propertyRoutes.js            # /api/properties
│   │   ├── 📄 adminRoutes.js               # /api/admin
│   │   ├── 📄 chatRoutes.js                # /api/chat
│   │   ├── 📄 applicationRoutes.js         # /api/applications
│   │   ├── 📄 comparisonRoutes.js          # /api/comparison
│   │   ├── 📄 ratingRoutes.js              # /api/rating
│   │   ├── 📄 statsRoutes.js               # /api/stats
│   │   ├── 📄 aiRoutes.js                  # /api/ai
│   │   ├── 📄 wishlistRoutes.js            # /api/wishlist
│   │   └── 📄 internalRoutes.js            # /api/internal
│   │
│   ├── 📁 models/                          # MongoDB schemas
│   │   ├── 📄 Chat.js                      # Chat schema
│   │   ├── 📄 Rating.js                    # Rating schema
│   │   ├── 📄 Comparison.js                # Comparison schema
│   │   ├── 📄 Wishlist.js                  # Wishlist schema
│   │   └── 📄 EmailJob.js                  # Email queue schema
│   │
│   ├── 📁 services/                        # Business logic services
│   │   ├── 📄 emailService.js              # Email sending
│   │   ├── 📄 emailJobService.js           # Email queue management
│   │   ├── 📄 emailNotificationService.js  # Notification emails
│   │   ├── 📄 emailProcessorService.js     # Process email jobs
│   │   ├── 📄 emailTemplateService.js      # Email templates
│   │   ├── 📄 groqService.js               # AI integration
│   │   ├── 📄 propertyAppraisalService.js  # Property valuation
│   │   ├── 📄 propertyDescriptionPromptService.js # Description prompts
│   │   └── 📄 nidRegistryService.js        # NID verification
│   │
│   ├── 📁 events/                          # Event handlers
│   │   └── 📄 chatEvents.js                # Socket.io chat events
│   │
│   ├── 📁 jobs/                            # Scheduled tasks
│   │   └── 📄 emailJobCron.js              # Email scheduling
│   │
│   └── 📁 utils/                           # Utility functions [NEW]
│       ├── 📄 responseHandler.js           # Response formatting
│       ├── 📄 errorHandler.js              # Custom error classes
│       ├── 📄 asyncHandler.js              # Async wrapper
│       └── 📄 logger.js                    # Logging utility
│
├── 📄 server.js                            # Entry point [UPDATED]
├── 📄 eslint.config.js                     # ESLint rules
├── 📄 package.json                         # Dependencies
├── 📄 ghor-bari-firebase-admin-sdk.json   # Firebase credentials
├── 📄 .env                                 # Environment variables (local)
├── 📄 .env.example                         # Environment template
├── 📄 .gitignore
└── 📄 README.md
```

---

## 📦 Setup & Installation

### Prerequisites

```bash
# Check versions
node --version     # Should be v18+
npm --version      # Should be v9+
git --version      # Any recent version
```

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/khandakeraliariyan/GHOR_BARI.git
cd GHOR_BARI/backend
```

#### 2. Install Dependencies

```bash
npm install

# Verify installation
npm list

# Check for vulnerabilities
npm audit
```

#### 3. Create Environment File

```bash
cp .env.example .env
# Edit .env with your credentials
```

#### 4. Add Firebase Credentials

```bash
# Download from Firebase Console > Project Settings > Service Accounts
# Save as ghor-bari-firebase-admin-sdk.json
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in backend directory:

```env
# ========== SERVER ==========
NODE_ENV=development
PORT=5000

# ========== DATABASE ==========
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=ghor-bari

# ========== FIREBASE ==========
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# ========== EMAIL ==========
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# ========== API KEYS ==========
GROQ_API_KEY=your-groq-api-key

# ========== FEATURES ==========
ENABLE_EMAIL_JOB_CRON=true
ENABLE_SOCKET_IO=true

# ========== JWT ==========
JWT_EXPIRY=7d
```

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save JSON file as `ghor-bari-firebase-admin-sdk.json`

### Gmail App Password

1. Enable 2-Factor Authentication on Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select Mail and Windows Computer
4. Copy generated password
5. Use in `EMAIL_PASSWORD` environment variable

---

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
# Server runs on http://localhost:5000
# Watch mode enabled for auto-restart on changes
```

### Production Mode

```bash
npm start
# Standard production start
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name ghor-bari

# View logs
pm2 logs ghor-bari

# Monitor
pm2 monit

# Save
pm2 save

# Restart on boot
pm2 startup
```

### Available Scripts

````bash
### Available Scripts

```bash
npm start           # Production start
npm run dev        # Development with watch mode
npm run lint       # Check code quality
npm run lint:fix   # Auto-fix lint errors
npm run format     # Check formatting
npm run format:write # Auto-format code
npm test           # Run tests
npm run test:coverage # Coverage report
````

---

## 📡 API Reference

### Authentication Endpoints

#### Register User

```http
POST /api/users/register-user
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "hashed_from_firebase",
  "name": "John Doe",
  "phone": "01712345678",
  "role": "property_seeker"  // or "property_owner"
}

Response 201:
{
  "success": true,
  "user": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "property_seeker"
  }
}
```

#### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response 200:
{
  "success": true,
  "token": "firebase_id_token",
  "user": { ... }
}
```

#### Get User Profile

```http
GET /api/users/user-profile
Authorization: Bearer <firebase_token>

Response 200:
{
  "success": true,
  "user": {
    "_id": "mongo_id",
    "email": "user@example.com",
    "name": "John Doe",
    "rating": 4.5,
    "reviewCount": 12,
    "nidVerified": true
  }
}
```

### Property Endpoints

#### List Properties

```http
GET /api/properties?page=1&limit=10&type=flat&listingType=rent&priceMin=10000&priceMax=50000&district=Dhaka

Query Parameters:
- page: Page number (default: 1)
- limit: Results per page (default: 10)
- type: Property type (flat/building)
- listingType: rent/sale
- priceMin/priceMax: Price range
- district/upazila: Location filters
- sortBy: newest/price/area/rating

Response 200:
{
  "success": true,
  "total": 150,
  "page": 1,
  "limit": 10,
  "properties": [...]
}
```

#### Get Property Details

```http
GET /api/properties/:propertyId

Response 200:
{
  "success": true,
  "property": {
    "_id": "property_id",
    "title": "Beautiful Flat",
    "description": "AI-generated description...",
    "price": 25000,
    "areaSqFt": 1200,
    "images": ["url1", "url2"],
    "owner": { ... },
    "rating": 4.2,
    "reviews": [...]
  }
}
```

#### Create Property

```http
POST /api/properties
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "title": "Beautiful Flat",
  "propertyType": "flat",
  "listingType": "rent",
  "price": 25000,
  "areaSqFt": 1200,
  "bedrooms": 2,
  "bathrooms": 1,
  "description": "", // Will be auto-generated if empty
  "address": {
    "street": "123 Main St",
    "division": "Dhaka",
    "district": "Dhaka",
    "upazila": "Banani"
  },
  "location": {
    "latitude": 23.8185,
    "longitude": 90.4010
  },
  "images": ["url1", "url2"],
  "amenities": ["wifi", "parking", "gym"]
}

Response 201:
{
  "success": true,
  "property": { ... }
}
```

#### Update Property

```http
PUT /api/properties/:propertyId
Authorization: Bearer <firebase_token>

{
  "title": "Updated Title",
  "price": 26000,
  ...
}

Response 200:
{
  "success": true,
  "property": { ... }
}
```

#### Delete Property

```http
DELETE /api/properties/:propertyId
Authorization: Bearer <firebase_token>

Response 200:
{
  "success": true,
  "message": "Property deleted"
}
```

### Chat Endpoints

#### Get Conversations

```http
GET /api/chat/conversations
Authorization: Bearer <firebase_token>

Response 200:
{
  "success": true,
  "conversations": [
    {
      "_id": "conversation_id",
      "participants": ["user1_id", "user2_id"],
      "lastMessage": "Interested in the property",
      "lastMessageTime": "2024-03-09T10:30:00Z"
    }
  ]
}
```

#### Get Messages

```http
GET /api/chat/:conversationId/messages
Authorization: Bearer <firebase_token>

Response 200:
{
  "success": true,
  "messages": [
    {
      "_id": "message_id",
      "sender": "user_id",
      "senderName": "John Doe",
      "text": "I'm interested",
      "read": true,
      "createdAt": "2024-03-09T10:30:00Z"
    }
  ]
}
```

#### Send Message

```http
POST /api/chat/:conversationId/messages
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "text": "I'm interested in this property",
  "attachments": []  // Optional image URLs
}

Response 201:
{
  "success": true,
  "message": { ... }
}
```

### Admin Endpoints

#### Get Properties for Moderation

```http
GET /api/admin/properties?status=pending
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "properties": [...]
}
```

#### Approve Property

```http
PUT /api/admin/properties/:propertyId/approve
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "message": "Property approved"
}
```

#### Reject Property

```http
PUT /api/admin/properties/:propertyId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Contains inappropriate content"
}

Response 200:
{
  "success": true,
  "message": "Property rejected"
}
```

#### Get All Users

```http
GET /api/admin/users?role=property_owner&verified=true
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "users": [...]
}
```

#### Verify User

```http
PUT /api/admin/users/:userId/verify
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "user": { ... }
}
```

### Rating Endpoints

#### Create Rating

```http
POST /api/ratings
Authorization: Bearer <firebase_token>

{
  "rateeId": "owner_id",
  "propertyId": "property_id",
  "rating": 5,
  "review": "Excellent property and owner",
  "category": "professionalism"  // communication, professionalism, etc
}

Response 201:
{
  "success": true,
  "rating": { ... }
}
```

#### Get User Ratings

```http
GET /api/ratings/user/:userId/average

Response 200:
{
  "success": true,
  "averageRating": 4.5,
  "totalReviews": 12,
  "ratings": [...]
}
```

### Wishlist Endpoints

#### Add to Wishlist

```http
POST /api/wishlist
Authorization: Bearer <firebase_token>

{
  "propertyId": "property_id",
  "notes": "Check this later"
}

Response 201:
{
  "success": true,
  "wishlistItem": { ... }
}
```

#### Get Wishlist

```http
GET /api/wishlist
Authorization: Bearer <firebase_token>

Response 200:
{
  "success": true,
  "wishlist": [...]
}
```

#### Remove from Wishlist

```http
DELETE /api/wishlist/:itemId
Authorization: Bearer <firebase_token>

Response 200:
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

## 🔧 Services Architecture

### Email Service Stack

#### Email Service (`emailService.js`)

```javascript
// Core email sending
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
```

#### Email Job Service (`emailJobService.js`)

```javascript
// Queue email jobs for processing
const queueEmail = async (to, subject, html) => {
  const emailJob = new EmailJob({
    to,
    subject,
    htmlContent: html,
    status: "pending",
    retryCount: 0,
  });

  await emailJob.save();
  return emailJob;
};
```

#### Email Processor (`emailJobCron.js`)

```javascript
// Process queued emails every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  const pendingJobs = await EmailJob.find({
    status: "pending",
    retryCount: { $lt: 3 },
  });

  for (const job of pendingJobs) {
    try {
      await sendEmail(job.to, job.subject, job.htmlContent);
      job.status = "sent";
      job.sentAt = new Date();
    } catch (error) {
      job.retryCount += 1;
      job.error = error.message;
      if (job.retryCount >= 3) {
        job.status = "failed";
      }
    }
    await job.save();
  }
});
```

### AI Service (`groqService.js`)

```javascript
// Generate property descriptions using Groq AI
const generateDescription = async (propertyData) => {
  const prompt = buildPrompt(propertyData);

  const response = await groq.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
};

const buildPrompt = (property) => {
  return `Generate a compelling property description for:
    - Type: ${property.propertyType}
    - Bedrooms: ${property.bedrooms}
    - Area: ${property.areaSqFt} sqft
    - Location: ${property.location}
    - Amenities: ${property.amenities.join(", ")}
    
    Keep it concise, professional, and persuasive. Under 150 words.`;
};
```

### Property Appraisal Service

```javascript
// Estimate property value
const calculateAppraisal = (property) => {
  let basePrice = property.price;

  // Adjust based on amenities
  const amenityMultipliers = {
    wifi: 1.05,
    parking: 1.08,
    gym: 1.1,
    furnished: 1.15,
  };

  for (const amenity of property.amenities) {
    basePrice *= amenityMultipliers[amenity] || 1.0;
  }

  // Adjust based on area
  const pricePerSqft = basePrice / property.areaSqFt;
  const adjustedPrice = pricePerSqft * property.areaSqFt * 1.05;

  return Math.round(adjustedPrice);
};
```

---

## 🔐 Middleware Pipeline

### Request Flow

```
Incoming Request
    ↓
Express Middleware (logging, parsing)
    ↓
CORS Middleware
    ↓
Rate Limiting
    ↓
Token Verification (verifyToken)
    ↓
Role Verification (verifyAdmin/verifyOwner)
    ↓
Route Handler (Controller)
    ↓
Business Logic (Services)
    ↓
Database Operation
    ↓
Response Formatting
    ↓
Error Handling
    ↓
Response Sent
```

### Token Verification Middleware

```javascript
// src/middleware/verifyToken.js
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};
```

### Admin Verification Middleware

```javascript
// src/middleware/verifyAdmin.js
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 💾 Database Optimization

### Indexes for Performance

```javascript
// Create indexes in MongoDB
db.properties.createIndex({ "owner.userId": 1 });
db.properties.createIndex({ "address.district": 1 });
db.properties.createIndex({ price: 1 });
db.properties.createIndex({ status: 1 });
db.properties.createIndex({ createdAt: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.chat.createIndex({ participants: 1 });
db.chat.createIndex({ lastMessageTime: -1 });

db.ratings.createIndex({ rateeId: 1 });
db.ratings.createIndex({ propertyId: 1 });
```

### Query Optimization

```javascript
// Inefficient query
const properties = await Property.find({ status: "approved" });

// Optimized with projection and lean
const properties = await Property.find({ status: "approved" })
  .select("title price image -_id") // Only needed fields
  .lean() // Don't create full Mongoose objects
  .limit(20)
  .skip((page - 1) * 20);
```

### Aggregation Pipeline

```javascript
// Complex query using aggregation
const stats = await Property.aggregate([
  { $match: { status: "approved" } },
  {
    $group: {
      _id: "$address.district",
      avgPrice: { $avg: "$price" },
      count: { $sum: 1 },
      maxPrice: { $max: "$price" },
      minPrice: { $min: "$price" },
    },
  },
  { $sort: { count: -1 } },
]);
```

---

## 🔄 Real-Time Chat with Socket.io

### Events Emitted

```javascript
// src/events/chatEvents.js
const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    // User joins conversation
    socket.on("join_conversation", (data) => {
      socket.join(data.conversationId);
      socket.to(data.conversationId).emit("user_joined", {
        userId: data.userId,
        userName: data.userName,
      });
    });

    // Send message
    socket.on("send_message", async (data) => {
      const message = await Message.create({
        conversationId: data.conversationId,
        sender: data.senderId,
        text: data.text,
        createdAt: new Date(),
      });

      io.to(data.conversationId).emit("receive_message", message);
    });

    // Typing indicator
    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("user_typing", {
        userId: data.userId,
        userName: data.userName,
      });
    });

    // Stop typing
    socket.on("stop_typing", (data) => {
      socket.to(data.conversationId).emit("user_stopped_typing", {
        userId: data.userId,
      });
    });

    // Mark messages as read
    socket.on("mark_read", async (data) => {
      await Message.updateMany({ conversationId: data.conversationId }, { read: true });

      io.to(data.conversationId).emit("messages_read");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
```

---

## ❌ Error Handling

### Custom Error Classes

```javascript
// src/utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 403);
  }
}

module.exports = { AppError, ValidationError, NotFoundError, UnauthorizedError };
```

### Async Error Wrapper

```javascript
// src/utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in controller
exports.getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new NotFoundError("Property not found");
  res.json(property);
});
```

### Global Error Handler

```javascript
// In server.js
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

---

## 📊 Logging System

```javascript
// src/utils/logger.js
const logEvent = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
  };

  console.log(JSON.stringify(logEntry));

  // Optional: Send to external logging service
  if (level === "error") {
    logToExternalService(logEntry);
  }
};

// Usage
logEvent("info", "Property created", {
  propertyId: property._id,
  ownerId: req.user.uid,
});

logEvent("error", "Email sending failed", {
  to: email,
  error: error.message,
});
```

---

## 🚀 Response Formatting

```javascript
// src/utils/responseHandler.js
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

// Controller usage
exports.getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return sendError(res, "Property not found", 404);
  }
  sendSuccess(res, property);
});
```

---

## 🔗 Related Documentation

- See [main README](/../../README.md) for project overview
- See [Frontend README](/../../client/README.md) for UI details
- See [BACKEND_VERCEL_DEPLOYMENT_GUIDE.md](/../../BACKEND_VERCEL_DEPLOYMENT_GUIDE.md) for deployment

---

## 🏆 Best Practices

### API Design

- Consistent response format
- Proper HTTP status codes
- Pagination for list endpoints
- Filtering and sorting support

### Database

- Index frequently queried fields
- Use lean() for read-only queries
- Implement connection pooling
- Monitor slow queries

### Security

- Validate all inputs
- Sanitize database queries
- Use HTTPS in production
- Implement rate limiting

### Performance

- Cache frequently accessed data
- Use async operations
- Implement pagination
- Leverage database indexes

---

**Last Updated**: March 2026  
**Maintained by**: Khandaker Ali Ariyan
npm run lint:fix # Auto-fix issues
npm run format # Check formatting
npm run format:write # Auto-format code

````

### Verify Server is Running

```bash
# Check health endpoint
curl http://localhost:5000/health

# Response: { "success": true, "status": "online" }
````

---

## 📚 API Reference

### Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: (To be configured)

### Authentication

All protected endpoints require Firebase ID token:

```javascript
headers: {
    'Authorization': 'Bearer <firebase_id_token>'
}
```

### Response Format

Success Response (200):

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {...}
}
```

Error Response (400+):

```json
{
  "success": false,
  "message": "Error description"
}
```

### User Endpoints

#### Register User

```http
POST /api/users/register-user
Content-Type: application/json

{
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "01712345678",
    "profileImage": "https://...",
    "role": "property_seeker"
}
```

#### Get User Profile

```http
GET /api/users/user-profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PATCH /api/users/update-profile
Authorization: Bearer <token>

{
    "name": "Jane Doe",
    "phone": "01798765432",
    "profileImage": "https://..."
}
```

#### Submit NID

```http
POST /api/users/submit-nid
Authorization: Bearer <token>

{
    "nidNumber": "1234567890123456",
    "nidImages": ["https://...", "https://..."]
}
```

### Property Endpoints

#### List Properties

```http
GET /api/properties?page=1&limit=10&type=flat&listingType=rent
```

#### Get Property Details

```http
GET /api/properties/:propertyId
```

#### Create Property

```http
POST /api/properties
Authorization: Bearer <token>

{
    "title": "Beautiful Apartment",
    "listingType": "rent",
    "propertyType": "flat",
    "price": 25000,
    "areaSqFt": 1200,
    "address": {
        "division_id": "1",
        "district_id": "10",
        "upazila_id": "100",
        "street": "Street name"
    },
    "location": {
        "lat": 23.8103,
        "lng": 90.4125
    },
    "images": ["https://..."],
    "amenities": ["WiFi", "Parking"],
    "roomCount": 3,
    "bathrooms": 2,
    "overview": "Description"
}
```

#### Update Property

```http
PATCH /api/properties/:propertyId
Authorization: Bearer <token>

{
    "title": "Updated Title",
    "price": 30000
    // Other fields...
}
```

#### Delete Property

```http
DELETE /api/properties/:propertyId
Authorization: Bearer <token>
```

### Chat Endpoints

#### Get Conversations

```http
GET /api/chat/conversations
Authorization: Bearer <token>
```

#### Get Chat Messages

```http
GET /api/chat/:conversationId
Authorization: Bearer <token>
```

#### Send Message

```http
POST /api/chat/:conversationId/messages
Authorization: Bearer <token>

{
    "text": "I'm interested in this property",
    "image": null
}
```

### Admin Endpoints

#### Get All Properties

```http
GET /api/admin/properties?status=pending
Authorization: Bearer <admin_token>
```

#### Approve Property

```http
PUT /api/admin/properties/:propertyId/approve
Authorization: Bearer <admin_token>
```

#### Reject Property

```http
PUT /api/admin/properties/:propertyId/reject
Authorization: Bearer <admin_token>

{
    "reason": "Inappropriate content"
}
```

#### Get All Users

```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Verify NID

```http
PUT /api/admin/users/:userId/verify-nid
Authorization: Bearer <admin_token>

{
    "verified": true
}
```

---

## 💾 Database

### Collections

#### Users

```javascript
{
    _id: ObjectId,
    email: String (unique),
    name: String,
    phone: String,
    profileImage: String,
    role: String,
    nidVerified: String,
    nidNumber: String,
    nidImages: [String],
    rating: {
        totalRatings: Number,
        ratingCount: Number,
        average: Number
    },
    createdAt: Date,
    updatedAt: Date
}
```

#### Properties

```javascript
{
    _id: ObjectId,
    title: String,
    listingType: String,
    propertyType: String,
    price: Number,
    areaSqFt: Number,
    address: {
        division_id: String,
        district_id: String,
        upazila_id: String,
        street: String
    },
    location: {
        lat: Number,
        lng: Number
    },
    images: [String],
    amenities: [String],
    roomCount: Number,
    bathrooms: Number,
    owner: {
        uid: String,
        name: String,
        email: String,
        photoURL: String
    },
    status: String,
    aiAppraisal: {
        marketValue: Number,
        rentalValue: Number,
        assessment: String
    },
    createdAt: Date,
    updatedAt: Date
}
```

#### Chat

```javascript
{
    _id: ObjectId,
    propertyId: ObjectId,
    participantOne: {...},
    participantTwo: {...},
    messages: [{
        timestamp: Date,
        sender: String,
        text: String,
        image: String,
        read: Boolean
    }],
    lastMessage: String,
    lastMessageTime: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### Database Indexes

Recommended indexes for performance:

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Properties
db.properties.createIndex({ "owner.email": 1 });
db.properties.createIndex({ status: 1 });
db.properties.createIndex({ "address.district_id": 1 });
db.properties.createIndex({ createdAt: -1 });

// Chat
db.chat.createIndex({ propertyId: 1 });
db.chat.createIndex({ "participantOne.email": 1 });
db.chat.createIndex({ lastMessageTime: -1 });
```

---

## 🔐 Authentication

### Firebase Token Flow

```
1. User logs in with Firebase
2. Firebase returns ID token
3. Frontend sends token in Authorization header
4. verifyToken middleware validates token
5. User info attached to request object
```

### Middleware Integration

```javascript
// Protected route example
router.get("/profile", verifyToken, userController.getUserProfile);

// Admin-only route
router.get("/admin/users", verifyToken, verifyAdmin, adminController.getAllUsers);
```

### Token Validation

```javascript
// Token is validated in verifyToken middleware
// Includes expiration check
// Verifies Firebase signature
// Extracts user information
```

---

## 💬 Real-Time Features

### Socket.io Setup

Server configuration in `src/config/socket.js`:

```javascript
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});
```

### Chat Events

```javascript
// Client emits
socket.emit("send_message", message);
socket.emit("typing", { conversationId });
socket.emit("join_conversation", conversationId);

// Server listens
io.on("connection", (socket) => {
  socket.on("send_message", handleMessage);
  socket.on("typing", handleTyping);
  socket.on("join_conversation", handleJoin);
});
```

### Event Handler Example

```javascript
socket.on("send_message", async (data) => {
  // Validate data
  // Save to database
  // Broadcast to recipients
  socket.emit("message_confirmed");
  io.to(conversationId).emit("receive_message", message);
});
```

---

## 🔧 Services

### Email Service

**Usage:**

```javascript
const emailService = require("../services/emailService");

await emailService.sendEmail({
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Welcome</h1>",
});
```

### Groq AI Service

**Usage:**

```javascript
const groqService = require("../services/groqService");

const description = await groqService.generatePropertyDescription(property);
```

### Property Appraisal Service

**Usage:**

```javascript
const appraisalService = require("../services/propertyAppraisalService");

const appraisal = await appraisalService.generatePropertyAppraisal(property);
```

---

## ❌ Error Handling

### Custom Error Classes

```javascript
// ValidationError (400)
throw new ValidationError("Email is required");

// NotFoundError (404)
throw new NotFoundError("User");

// ForbiddenError (403)
throw new ForbiddenError("Access denied");

// ConflictError (409)
throw new ConflictError("User already exists");
```

### Global Error Handler

All errors caught by middleware and formatted consistently:

```javascript
{
    success: false,
    message: "Error description"
}
```

### Error Logging

```javascript
logger.error("Database error", {
  error: err.message,
  userId: req.user?.id,
});
```

---

## ⚡ Performance

### Optimization Techniques

- **Database Indexing**: Speed up queries
- **Pagination**: Limit result sets
- **Lazy Loading**: Load data on demand
- **Caching**: Redis integration (optional)
- **Compression**: Gzip responses
- **Query Optimization**: Select only needed fields

### Monitoring

```bash
# Monitor memory usage
pm2 monit

# Check logs
pm2 logs ghor-bari

# View process list
pm2 list
```

---

## 🚀 Deployment

### Environment Setup

```env
NODE_ENV=production
PORT=5000
# Add all required variables
```

### Deployment Steps

1. Push code to GitHub
2. Connect to deployment platform (Heroku/Railway)
3. Set environment variables
4. Deploy
5. Verify with health check

### Health Check

```bash
curl https://your-domain/health
# Should return: { "success": true, "status": "online" }
```

---

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find and kill process
lsof -i :5000  # macOS
netstat -ano | findstr :5000  # Windows
kill -9 <PID>
```

#### MongoDB Connection Failed

- Verify MONGODB_URI is correct
- Check database credentials
- Verify IP is whitelisted in Atlas
- Test connection locally

#### Firebase Authentication Error

- Verify service account JSON file
- Check FIREBASE_PROJECT_ID
- Ensure Firebase project exists
- Verify private key formatting

#### Module Not Found

```bash
rm -rf node_modules
npm install
npm audit fix
```

#### Socket.io Not Connecting

- Verify ENABLE_SOCKET_IO=true
- Check backend server is running
- Verify CORS configuration
- Reset browser cache

---

## 👨‍💻 Development

### Code Structure

Follow MVC pattern:

- **Models**: Database schemas
- **Views**: API responses (handled by frontend)
- **Controllers**: Business logic

### Best Practices

- Use `asyncHandler` wrapper for async functions
- Throw custom error classes for errors
- Use `logger` for all logging
- Validate input data before processing
- Use constants instead of magic strings
- Add JSDoc comments to functions

### Testing

```bash
# Test API endpoint
curl -X GET http://localhost:5000/api/properties

# With authentication
curl -X GET http://localhost:5000/api/users/user-profile \
  -H "Authorization: Bearer <token>"
```

### Code Quality

```bash
npm run lint       # Check code
npm run lint:fix   # Auto-fix
npm run format     # Check formatting
npm run format:write # Auto-format
```

---

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Socket.io Documentation](https://socket.io/docs/)
- [Groq API Documentation](https://www.groq.com/api/)

---

**Last Updated**: March 2026

**Version**: 1.0.0

**Maintainer**: Khandaker Aliariyan
