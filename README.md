# 🏠 Ghor Bari - Property Rental & Listing Platform

<div align="center">

A comprehensive full-stack web application for buying, renting, and managing property listings in Bangladesh with real-time chat functionality, AI-powered property descriptions, and advanced admin dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Configuration](#-configuration) • [API Docs](#-api-documentation) • [Architecture](#-project-architecture) • [Deployment](#-deployment-guide)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Architecture](#-project-architecture)
- [Database Schema](#-database-schema)
- [Real-Time Features](#-real-time-features)
- [Security Features](#-security-features)
- [Performance Optimization](#-performance-optimization)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting-guide)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**Ghor Bari** (গৃহ বারি - "Home" in Bengali) is a modern, feature-rich property platform specifically designed for the Bangladesh real estate market. It connects property owners with potential buyers and renters, facilitating seamless property discovery, communication, and transactions.

### Key Highlights

- 🌐 **Geo-Location Based Search**: Find properties by Division, District, and Upazila
- 💬 **Real-Time Chat**: Instant messaging powered by Socket.io
- 🤖 **AI Integration**: Groq API for intelligent property descriptions
- ✅ **Verification System**: NID-based user verification for trust
- 📊 **Advanced Analytics**: Dashboard with detailed insights
- 🔒 **Enterprise Security**: Secure authentication and data protection
- 📱 **Mobile Responsive**: Fully optimized for all devices
- ⚡ **High Performance**: Optimized caching and database queries

---

## ✨ Features

## ✨ Features

### 👤 User Features

#### 🔍 **Advanced Property Search**

- Filter by property type (flat/building)
- Filter by listing type (rent/sale)
- Multi-level location filtering (Division → District → Upazila → Street)
- Price range and area filtering
- Sorting options (newest, price, area, popularity)
- Advanced filters (amenities, rooms, bathrooms)

#### 💬 **Real-Time Chat**

- Instant messaging with property owners
- Typing indicators and read receipts
- Chat history and conversation management
- Image sharing in messages
- Offline message queuing

#### 🔐 **Secure Authentication**

- Firebase-based secure authentication
- Email/password registration and login
- Social login (Google, Facebook)
- Password reset and recovery
- Two-factor authentication support

#### ⭐ **Property Comparison**

- Compare multiple properties side-by-side
- Feature comparison matrix
- Price comparison and analysis

#### 📋 **Detailed Property Listings**

- Professional property photos with gallery
- AI-generated property descriptions
- Interactive maps showing location
- Comprehensive property specifications
- User reviews and ratings

#### ❤️ **Wishlist Management**

- Save favorite properties
- Personal notes on properties
- Wishlist organization and sharing

#### ⭐ **Rating & Reviews System**

- Rate property owners
- Submit property reviews
- Trust indicators and reputation

### 🏢 Property Management

#### 📝 **Property Creation**

- Intuitive property creation wizard
- Support for flat and building properties
- Bulk image upload with drag-and-drop
- AI-powered description generation
- Automatic property appraisal

#### ✏️ **Property Management**

- Edit property details anytime
- Image management and rearrangement
- Publish/unpublish listings
- Property performance tracking

#### 📊 **Application Tracking**

- View and manage buyer/renter applications
- Application status tracking
- Direct communication with applicants

### 🛠️ Admin Features

#### 👥 **Comprehensive User Management**

- View all users with detailed profiles
- User role assignment and management
- User activity tracking
- Advanced search and filtering
- Bulk user operations

#### 🏠 **Property Moderation System**

- Review pending property listings
- Approve/reject with feedback
- Edit and remove listings
- Bulk moderation actions

#### ✅ **Verification System**

- NID document submission workflow
- User verification status tracking
- Verification auditing

#### 📊 **Analytics & Dashboard**

- Real-time system statistics
- User growth analytics
- Revenue and performance metrics
- System health monitoring

---

## 🛠️ Tech Stack

### Frontend Technologies

| Technology           | Purpose                      | Version |
| -------------------- | ---------------------------- | ------- |
| **React**            | Component-based UI framework | 18.x    |
| **Vite**             | Ultra-fast build tool        | 4.x     |
| **TailwindCSS**      | Utility-first CSS framework  | 3.x     |
| **Axios**            | HTTP client library          | 1.7.7   |
| **React Router**     | Client-side routing          | 6.x     |
| **Firebase SDK**     | Authentication & services    | 10.x    |
| **Socket.io Client** | Real-time communication      | 4.8.1   |

### Backend Technologies

| Technology             | Purpose                 | Version |
| ---------------------- | ----------------------- | ------- |
| **Node.js**            | JavaScript runtime      | 18+ LTS |
| **Express.js**         | Web framework           | 5.2.1   |
| **MongoDB**            | NoSQL database          | 6.x+    |
| **Mongoose**           | MongoDB ODM             | 9.0.1   |
| **Firebase Admin SDK** | Server-side Firebase    | 13.7.0  |
| **Socket.io**          | Real-time communication | 4.8.1   |
| **Node-cron**          | Task scheduling         | 4.2.1   |
| **Nodemailer**         | Email service           | 8.0.1   |
| **Bcryptjs**           | Password encryption     | 3.0.3   |

### External Services

| Service             | Purpose               |
| ------------------- | --------------------- |
| **Groq API**        | AI content generation |
| **Firebase Auth**   | User authentication   |
| **ImgBB**           | Image hosting         |
| **Google Maps API** | Location services     |
| **Nodemailer**      | Email notifications   |

---

## 📁 Project Structure

```
GHOR_BARI/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📄 app.js
│   │   ├── 📁 config/
│   │   │   ├── 📄 db.js
│   │   │   ├── 📄 environment.js [NEW]
│   │   │   ├── 📄 constants.js [NEW]
│   │   │   ├── 📄 firebase.js
│   │   │   └── 📄 socket.js
│   │   ├── 📁 controllers/
│   │   ├── 📁 models/
│   │   ├── 📁 routes/
│   │   ├── 📁 middleware/ [REFACTORED]
│   │   ├── 📁 services/
│   │   ├── 📁 events/
│   │   ├── 📁 jobs/
│   │   └── 📁 utils/ [NEW]
│   ├── 📄 server.js [UPDATED]
│   └── 📄 package.json
│
├── 📁 client/
│   ├── 📁 src/
│   │   ├── 📄 main.jsx
│   │   ├── 📄 Router.jsx
│   │   ├── 📁 Components/
│   │   ├── 📁 Pages/
│   │   ├── 📁 Hooks/
│   │   ├── 📁 context/
│   │   ├── 📁 Firebase/
│   │   ├── 📁 Layouts/
│   │   ├── 📁 PrivateRoute/
│   │   └── 📁 Utilities/
│   ├── 📁 public/
│   ├── 📄 index.html
│   ├── 📄 vite.config.js
│   └── 📄 package.json
│
├── 📄 README.md [UPDATED]
├── 📄 BACKEND_REFACTORING.md [NEW]
├── 📄 BACKEND_DEPLOYMENT_GUIDE.md [NEW]
└── 📄 LICENSE
```

---

## 📦 Installation

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud)
- **Firebase Project** ([Create here](https://console.firebase.google.com))
- **Git** for version control
- **VS Code** (or your preferred editor)

### Step 1: Clone Repository

```bash
git clone https://github.com/khandakeraliariyan/GHOR_BARI.git
cd GHOR_BARI
```

### Step 2: Backend Setup

```bash
cd backend
npm install
# Create .env file with required variables
```

### Step 3: Frontend Setup

```bash
cd client
npm install
# Create .env file with Firebase config
```

---

## ⚙️ Configuration

### Backend .env

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=ghor-bari

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

GROQ_API_KEY=your-groq-key

ENABLE_EMAIL_JOB_CRON=true
ENABLE_SOCKET_IO=true
```

### Frontend .env

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_SERVER_URL=http://localhost:5000
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### Production Build

```bash
# Frontend
cd client
npm run build
npm run preview

# Backend uses PM2 or similar process manager
```

### Available Scripts

**Backend:**

- `npm start` - Run server
- `npm run dev` - Development with watch mode
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix issues
- `npm run format` - Check formatting
- `npm run format:write` - Auto-format

**Frontend:**

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Check code quality

---

## 📚 API Documentation

### Base URL

- Development: `http://localhost:5000/api`
- Production: (TBD)

### User Endpoints

**Register User**

```http
POST /api/users/register-user
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "01712345678",
  "role": "property_seeker"
}
```

**Get User Profile**

```http
GET /api/users/user-profile
Authorization: Bearer <firebase_token>
```

### Property Endpoints

**List Properties**

```http
GET /api/properties?page=1&limit=10&type=flat&listingType=rent
```

**Create Property**

```http
POST /api/properties
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "title": "Beautiful Apartment",
  "listingType": "rent",
  "propertyType": "flat",
  "price": 25000,
  "areaSqFt": 1200,
  "address": {...},
  "location": {...},
  "images": [...],
  "amenities": [...]
}
```

### Chat Endpoints

**Get Conversations**

```http
GET /api/chat/conversations
Authorization: Bearer <firebase_token>
```

**Send Message**

```http
POST /api/chat/:conversationId/messages
Authorization: Bearer <firebase_token>

{
  "text": "I'm interested"
}
```

### Admin Endpoints

**Get Properties**

```http
GET /api/admin/properties?status=pending
Authorization: Bearer <admin_token>
```

**Approve Property**

```http
PUT /api/admin/properties/:id/approve
Authorization: Bearer <admin_token>
```

---

## 🏗️ Project Architecture

### MVC Pattern

```
Routes → Controllers → Services → Models → Database
   ↓        ↓            ↓
Middleware → Business Logic → Data Access Layer
```

### Component Structure

```
Frontend
├── Pages (Route components)
├── Components (Reusable UI)
├── Hooks (Logic encapsulation)
├── Context (State management)
└── Utilities (Helpers)
```

---

## 📊 Database Collections

### Users

- Email, name, phone, profile image
- Role (admin, owner, seeker)
- NID verification status
- Rating and review data
- Timestamps

### Properties

- Title, description, images
- Price, area, type, listing type
- Location (address + coordinates)
- Owner information
- Status and appraisal data
- Timestamps

### Chat

- Conversation ID, participants
- Message threads
- Read status, timestamps
- Attachment support

### Email Jobs

- User email and subject
- HTML content
- Status (pending, sent, failed)
- Retry information

---

## 💬 Real-Time Features

### Socket.io Events

**Client → Server:**

- `send_message`: Send chat message
- `typing`: User typing indicator
- `join_conversation`: Enter chat
- `mark_read`: Mark message as read

**Server → Client:**

- `receive_message`: New message arrived
- `user_typing`: Someone typing
- `message_confirmed`: Message sent
- `notification`: System notification

---

## 🔒 Security Features

- **Firebase Authentication**: Secure login/signup
- **Token Verification**: JWT validation on protected routes
- **Role-Based Access**: Admin/Owner/Seeker permissions
- **Password Hashing**: Bcryptjs encryption
- **CORS Protection**: Configured origins
- **Input Validation**: Data sanitization
- **Error Handling**: Safe error messages
- **Environment Variables**: Sensitive data in .env

---

## ⚡ Performance Optimization

- **Code Splitting**: Route-based bundles
- **Image Optimization**: Lazy loading
- **Database Indexing**: Optimized queries
- **Caching Strategy**: Smart cache headers
- **Compression**: Gzip responses
- **Pagination**: Limited result sets

---

## 🚀 Deployment Guide

### Frontend (Vercel)

```bash
npm run build
vercel deploy
```

### Backend (Railway/Heroku)

```bash
git push heroku main
# Set environment variables in dashboard
```

### Database (MongoDB Atlas)

1. Create cluster on Atlas
2. Configure IP whitelist
3. Get connection string
4. Add to backend .env

---

## 📂 Detailed Project Structure

### Backend Structure

#### `src/config/` - Configuration Files

| File          | Purpose                               |
| ------------- | ------------------------------------- |
| `db.js`       | MongoDB connection and initialization |
| `firebase.js` | Firebase Admin SDK configuration      |
| `socket.js`   | Socket.io server configuration        |

#### `src/controllers/` - Request Handlers

| Controller                 | Responsibilities                                |
| -------------------------- | ----------------------------------------------- |
| `userController.js`        | User registration, profile, verification        |
| `propertyController.js`    | Property CRUD operations, filtering, search     |
| `chatController.js`        | Chat messages, conversations, history           |
| `applicationController.js` | Buyer/renter applications management            |
| `adminController.js`       | Admin-only operations, user/property moderation |
| `aiController.js`          | AI-powered property descriptions using Groq API |
| `ratingController.js`      | User ratings and reviews                        |
| `wishlistController.js`    | Wishlist CRUD operations                        |
| `comparisonController.js`  | Property comparison features                    |
| `statsController.js`       | System analytics and statistics                 |

#### `src/services/` - Business Logic

| Service                               | Functionality                            |
| ------------------------------------- | ---------------------------------------- |
| `emailService.js`                     | Core email sending functionality         |
| `emailNotificationService.js`         | Notification-specific email templates    |
| `emailProcessorService.js`            | Email processing and queueing            |
| `emailJobService.js`                  | Email job management                     |
| `emailTemplateService.js`             | HTML email template generation           |
| `groqService.js`                      | Groq API integration for AI descriptions |
| `nidVerificationService.js`           | NID document verification logic          |
| `nidRegistryService.js`               | NID registry interactions                |
| `propertyAppraisalService.js`         | Property value estimation                |
| `propertyDescriptionPromptService.js` | AI prompt engineering for descriptions   |

#### `src/models/` - Data Models

| Model           | Description                     |
| --------------- | ------------------------------- |
| `Chat.js`       | Chat messages and conversations |
| `Comparison.js` | Property comparison records     |
| `Rating.js`     | User ratings and reviews        |
| `Wishlist.js`   | User wishlists                  |
| `EmailJob.js`   | Email job queue and history     |

#### `src/routes/` - API Endpoints

| Route                  | Base Path           | Purpose                        |
| ---------------------- | ------------------- | ------------------------------ |
| `userRoutes.js`        | `/api/users`        | User authentication & profiles |
| `propertyRoutes.js`    | `/api/properties`   | Property listings              |
| `chatRoutes.js`        | `/api/chat`         | Messaging system               |
| `applicationRoutes.js` | `/api/applications` | Applications                   |
| `adminRoutes.js`       | `/api/admin`        | Admin operations               |
| `aiRoutes.js`          | `/api/ai`           | AI services                    |
| `ratingRoutes.js`      | `/api/ratings`      | Ratings & reviews              |
| `wishlistRoutes.js`    | `/api/wishlist`     | Wishlist operations            |
| `comparisonRoutes.js`  | `/api/comparison`   | Property comparison            |
| `statsRoutes.js`       | `/api/stats`        | Analytics                      |
| `internalRoutes.js`    | `/api/internal`     | Internal operations            |

#### `src/middleware/` - Request Processing

| Middleware               | Purpose                       |
| ------------------------ | ----------------------------- |
| `verifyToken.js`         | Firebase token validation     |
| `verifyAdmin.js`         | Admin role verification       |
| `verifyOwner.js`         | Property owner verification   |
| `verifyPropertyOwner.js` | Property ownership validation |

#### `src/events/` - Event Handling

| File            | Purpose                       |
| --------------- | ----------------------------- |
| `chatEvents.js` | Socket.io chat event handlers |

#### `src/jobs/` - Scheduled Tasks

| Job                      | Schedule              | Purpose                 |
| ------------------------ | --------------------- | ----------------------- |
| `emailJobCron.js`        | Configurable interval | Process pending emails  |
| `nidVerificationCron.js` | Scheduled             | NID verification checks |

### Frontend Structure

#### `src/Pages/` - Route Components

Main page components that map to routes in `Router.jsx`:

- Home page with featured properties
- Property details page
- Search and filter page
- User profile dashboard
- Chat interface
- Admin dashboard
- Property creation/editing
- Comparison page

#### `src/Components/` - Reusable Components

| Component                      | Purpose                |
| ------------------------------ | ---------------------- |
| `NavBar.jsx`                   | Navigation header      |
| `Footer.jsx`                   | Page footer            |
| `Banner.jsx`                   | Hero banner section    |
| `FeaturedProperties.jsx`       | Property showcase      |
| `BeginYourPropertyJourney.jsx` | CTA section            |
| `FAQSection.jsx`               | FAQ accordion          |
| `HomePageStats.jsx`            | Statistics display     |
| `GhorAI.jsx`                   | AI feature showcase    |
| `WhyChooseUs.jsx`              | USP section            |
| `Loading.jsx`                  | Loading spinner        |
| `MapPicker.jsx`                | Location selection map |
| `WishlistNoteModal.jsx`        | Wishlist note editor   |

#### `src/Hooks/` - Custom React Hooks

Reusable logic for:

- Authentication state
- API data fetching
- Form handling
- Local storage
- Window events

#### `src/context/` - State Management

| Context                 | State Managed                 |
| ----------------------- | ----------------------------- |
| `ChatContext.jsx`       | Chat messages & conversations |
| `ComparisonContext.jsx` | Comparison list               |
| Other contexts          | Theme, user, notifications    |

#### `src/Utilities/` - Helper Functions

- API request handlers
- Validation functions
- Formatting utilities
- Constants and enums
- Error handlers

#### `src/Firebase/` - Firebase Configuration

- Firebase initialization
- Auth service helpers
- Firestore queries
- Storage operations

#### `src/Layouts/` - Layout Components

- Main layout wrapper
- Dashboard layout
- Admin layout

#### `src/PrivateRoute/` - Route Protection

- Protected route components
- Role-based access control

#### `public/` - Static Assets

| File                                | Content                         |
| ----------------------------------- | ------------------------------- |
| `bangladeshAdministrativeData.js`   | Administrative divisions (JS)   |
| `bangladeshAdministrativeData.json` | Administrative divisions (JSON) |
| `divisions.json`                    | Division list                   |
| `districts.json`                    | District list                   |
| `upzillas.json`                     | Upazila list                    |
| `thanas.json`                       | Thana list                      |
| `districts-new.json`                | Updated district data           |

---

## 🗄️ Database Schema Details

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  phone: String,
  profileImage: String,
  role: String, // admin, property_owner, property_seeker
  nidVerificationStatus: String, // pending, verified, rejected
  nidDocument: String,
  bio: String,
  rating: Number,
  reviewCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Properties Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  propertyType: String, // flat, building
  listingType: String, // rent, sale
  price: Number,
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  images: [String],
  location: {
    division: String,
    district: String,
    upazila: String,
    street: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  address: String,
  amenities: [String],
  ownerId: ObjectId,
  ownerName: String,
  ownerPhone: String,
  ownerEmail: String,
  status: String, // pending, approved, rejected, archived
  appraisalValue: Number,
  views: Number,
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Collection

```javascript
{
  _id: ObjectId,
  conversationId: String,
  participants: [ObjectId],
  messages: [{
    _id: ObjectId,
    senderId: ObjectId,
    senderName: String,
    text: String,
    attachments: [String],
    isRead: Boolean,
    createdAt: Date
  }],
  lastMessage: String,
  lastMessageTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Ratings Collection

```javascript
{
  _id: ObjectId,
  raterId: ObjectId,
  rateeId: ObjectId,
  propertyId: ObjectId,
  rating: Number, // 1-5
  review: String,
  category: String, // communication, professionalism, etc
  createdAt: Date,
  updatedAt: Date
}
```

### Wishlist Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  propertyId: ObjectId,
  notes: String,
  priority: String, // high, medium, low
  createdAt: Date,
  updatedAt: Date
}
```

### Email Jobs Collection

```javascript
{
  _id: ObjectId,
  to: String,
  subject: String,
  htmlContent: String,
  status: String, // pending, sent, failed
  retryCount: Number,
  error: String,
  createdAt: Date,
  sentAt: Date,
  updatedAt: Date
}
```

---

## 🔄 API Routes Summary

### User Routes (`/api/users`)

- `POST /register-user` - Register new user
- `GET /user-profile` - Get current user profile
- `PUT /update-profile` - Update user information
- `GET /all-users` - Get all users (admin)
- `GET /:userId` - Get specific user
- `PUT /:userId` - Update user (admin)
- `DELETE /:userId` - Delete user (admin)

### Property Routes (`/api/properties`)

- `POST /` - Create property
- `GET /` - List properties with filters
- `GET /:id` - Get property details
- `PUT /:id` - Update property
- `DELETE /:id` - Delete property
- `GET /:id/appraisal` - Get property appraisal
- `POST /:id/views` - Increment view count
- `GET /user/:userId` - Get user's properties

### Chat Routes (`/api/chat`)

- `GET /conversations` - Get user conversations
- `GET /conversations/:id` - Get conversation details
- `POST /conversations/:id/messages` - Send message
- `GET /conversations/:id/messages` - Get messages
- `PUT /messages/:id/read` - Mark as read

### Application Routes (`/api/applications`)

- `POST /` - Submit application
- `GET /` - Get applications
- `GET /:id` - Get application details
- `PUT /:id/status` - Update application status
- `DELETE /:id` - Cancel application

### Admin Routes (`/api/admin`)

- `GET /properties` - List properties for moderation
- `PUT /properties/:id/approve` - Approve property
- `PUT /properties/:id/reject` - Reject property
- `GET /users` - Manage users
- `GET /verifications` - View verification requests
- `PUT /verifications/:id` - Update verification status
- `GET /analytics` - System analytics

### Rating Routes (`/api/ratings`)

- `POST /` - Create rating
- `GET /` - Get ratings
- `GET /user/:userId/average` - User average rating
- `GET /property/:propertyId/average` - Property rating

### Wishlist Routes (`/api/wishlist`)

- `POST /` - Add to wishlist
- `GET /` - Get user's wishlist
- `DELETE /:id` - Remove from wishlist
- `PUT /:id` - Update wishlist item

### Comparison Routes (`/api/comparison`)

- `POST /` - Create comparison
- `GET /:id` - Get comparison
- `DELETE /:id` - Delete comparison

### Stats Routes (`/api/stats`)

- `GET /` - Get system statistics
- `GET /user-growth` - User growth analytics
- `GET /property-stats` - Property statistics

---

## 🚀 Enhanced Deployment Guide

### Backend Deployment Options

#### Option 1: Railway.app

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy button automatically builds and deploys

#### Option 2: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create ghor-bari-backend
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
# ... set other variables
```

#### Option 3: AWS EC2

1. Launch EC2 instance (Ubuntu 20.04)
2. SSH into instance
3. Install Node.js, MongoDB client
4. Clone repository
5. Install dependencies
6. Set up PM2 for process management
7. Configure Nginx as reverse proxy

**PM2 Setup:**

```bash
npm install -g pm2
pm2 start server.js --name "ghor-bari"
pm2 save
pm2 startup
```

### Frontend Deployment

#### Vercel (Recommended)

```bash
npm run build
vercel deploy --prod
```

#### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

#### GitHub Pages

1. Update `vite.config.js` with base path
2. Run build
3. Deploy to gh-pages branch

---

## 📊 Environment Variables Reference

### Backend Variables

```env
# Server Configuration
NODE_ENV=development|production
PORT=5000
LOG_LEVEL=debug|info|warn|error

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true
DB_NAME=ghor-bari

# Firebase (Admin SDK)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@appspot.gserviceaccount.com

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=Ghor Bari <noreply@ghorbari.com>

# Groq API
GROQ_API_KEY=your-groq-api-key

# Features
ENABLE_EMAIL_JOB_CRON=true
ENABLE_SOCKET_IO=true
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# External Services
IMGBB_API_KEY=your-imgbb-key
GOOGLE_MAPS_API_KEY=your-google-maps-key

# JWT/Security
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=7d
```

### Frontend Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=ghor-bari.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ghor-bari
VITE_FIREBASE_STORAGE_BUCKET=ghor-bari.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Server URL
VITE_SERVER_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api

# Feature Flags
VITE_ENABLE_REAL_TIME_CHAT=true
VITE_ENABLE_AI_DESCRIPTIONS=true
```

---

## 🔧 Development Workflow

### Local Development Setup Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB running locally or Atlas connection ready
- [ ] Firebase project created and credentials obtained
- [ ] Groq API key obtained
- [ ] Gmail app password generated
- [ ] Clone repository
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Create `.env` files (backend and frontend)
- [ ] Test MongoDB connection
- [ ] Test Firebase Admin SDK
- [ ] Run `npm run dev` in both directories
- [ ] Verify both servers start without errors

### Testing

**Backend Tests:**

```bash
cd backend
npm test
npm run test:coverage
```

**Frontend Tests:**

```bash
cd client
npm test
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format:write

# Type checking (if using TypeScript)
npm run type-check
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
lsof -i :5000  # Find process
kill -9 <PID>   # Kill process
# Or change PORT in .env
```

### MongoDB Connection Failed

- Verify connection string
- Check database credentials
- Whitelist your IP in MongoDB Atlas
- Ensure MongoDB is running locally

### Firebase Auth Error

- Verify service account JSON
- Check FIREBASE_PROJECT_ID
- Ensure Authentication is enabled
- Check Firebase credentials format

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Socket.io Connection Failed

- Verify backend is running
- Check ENABLE_SOCKET_IO=true
- Verify CORS is configured
- Check frontend Socket.io URL

---

## 🤝 Contributing

### Guidelines

- Use meaningful branch names: `feature/feature-name`
- Write clear commit messages
- Follow code style (ESLint/Prettier)
- Test your changes
- Create detailed pull requests

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Write JSDoc comments
- Use meaningful variable names

### Commit Format

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Refactor code
test: Add tests
chore: Maintenance
```

---

## 📄 License

This project is licensed under the ISC License. See [LICENSE](./LICENSE) for details.

---

## 📞 Support

- **Documentation**: Read [BACKEND_REFACTORING.md](./backend/BACKEND_REFACTORING.md)
- **Issues**: [GitHub Issues](https://github.com/khandakeraliariyan/GHOR_BARI/issues)
- **Email**: [Contact Developer]

### Reporting Bugs

1. Check if bug exists in issues
2. Create new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - System info (OS, Node version, etc.)

### Common Issues & Solutions

#### Issue: CORS Error

**Problem:** Request blocked due to CORS policy

**Solution:**

```javascript
// In backend app.js, verify CORS is configured:
app.use(
  cors({
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
```

#### Issue: Firebase Authentication Fails

**Problem:** "Invalid service account" error

**Solution:**

1. Download service account JSON from Firebase Console
2. Copy PRIVATE_KEY (with proper newlines: `\n`)
3. Verify format:

```json
{
  "type": "service_account",
  "project_id": "..."
}
```

4. Restart backend server

#### Issue: MongoDB Timeout

**Problem:** "MongooseError: Cannot connect to MongoDB"

**Solution:**

```bash
# Test connection string
mongo "mongodb+srv://user:pass@cluster.mongodb.net/test"

# Check MongoDB Atlas:
# 1. Verify IP whitelist includes your IP (0.0.0.0/0 for dev)
# 2. Check database user credentials
# 3. Ensure cluster is running
```

#### Issue: Email Not Sending

**Problem:** Email jobs queued but not sent

**Solution:**

```bash
# Backend console should show job processing
# Check logs for:
# 1. ENABLE_EMAIL_JOB_CRON=true
# 2. Valid SMTP credentials
# 3. Gmail "Less Secure" apps or App Password
# 4. No rate limiting
```

#### Issue: Real-Time Chat Not Working

**Problem:** Messages not appearing in real-time

**Solution:**

1. Check Socket.io connection in browser DevTools > Network > WS
2. Verify backend is running
3. Confirm `ENABLE_SOCKET_IO=true`
4. Check `SOCKET_IO_CORS_ORIGIN` matches frontend URL
5. Check both servers are on same network

#### Issue: Image Upload Fails

**Problem:** Images not saved or uploaded to ImgBB

**Solution:**

1. Verify ImgBB API key is valid
2. Check API usage limits
3. Ensure image size < 32MB
4. Verify allowed formats: JPG, PNG, GIF, WebP

#### Issue: AI Description Generation Slow

**Problem:** Property description generation takes too long

**Solution:**

1. Check Groq API key quota
2. Verify API response in server logs
3. Consider caching generated descriptions
4. Use shorter prompts for faster generation

---

## 📱 Mobile Experience

The application is fully responsive and optimized for:

- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Progressive Web App (PWA) capabilities

### Mobile Testing

```bash
# Test on local network
npm run dev -- --host 0.0.0.0

# Access from mobile
http://<your-ip>:5173
```

---

## 🔐 Security Best Practices

### For Developers

1. **Never commit `.env` files**

   ```bash
   # .gitignore should contain
   .env
   .env.local
   .env.*.local
   ```

2. **Use Firebase Firestore Rules**

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

3. **Validate All Input**

   ```javascript
   // Always validate and sanitize
   const { name, email } = req.body;
   if (!name || !email) return res.status(400).json({ error });
   ```

4. **Use HTTPS in Production**
   ```javascript
   // Redirect HTTP to HTTPS
   if (process.env.NODE_ENV === "production") {
     app.use((req, res, next) => {
       if (req.header("x-forwarded-proto") !== "https") {
         res.redirect(`https://${req.header("host")}${req.url}`);
       }
       next();
     });
   }
   ```

---

## 📚 Additional Resources

### Official Documentation

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

### External APIs

- [Groq API Docs](https://console.groq.com/docs)
- [Google Maps API](https://developers.google.com/maps)
- [ImgBB Documentation](https://api.imgbb.com/)

### Learning Resources

- [Express.js Tutorial](https://www.w3schools.com/nodejs/nodejs_express.asp)
- [MERN Stack Guide](https://www.geeksforgeeks.org/mern-stack/)
- [Socket.io Real-Time Apps](https://socket.io/docs/)

---

## 🎯 Project Milestones

### Phase 1: MVP (Completed)

- ✅ Basic property listing
- ✅ User authentication
- ✅ Chat functionality
- ✅ Property search

### Phase 2: Enhancement (In Progress)

- 🚀 AI-powered descriptions
- 🚀 NID verification system
- 🚀 Advanced analytics
- 🚀 Admin dashboard

### Phase 3: Scaling (Planned)

- 📋 Mobile apps (iOS/Android)
- 📋 Payment gateway integration
- 📋 Virtual property tours
- 📋 Machine learning recommendations

---

## 🏆 Key Features by Use Case

### For Property Seekers

1. **Search** - Find properties by location, price, type
2. **Compare** - Side-by-side property comparison
3. **Chat** - Direct communication with owners
4. **Wishlist** - Save favorite properties
5. **Reviews** - Read owner/property reviews
6. **Notifications** - Get alerts for new listings

### For Property Owners

1. **List** - Create detailed property listings
2. **Manage** - Edit/update property info
3. **AI Descriptions** - Auto-generate descriptions
4. **Applications** - Track buyer/renter inquiries
5. **Analytics** - View property performance
6. **Ratings** - Manage reputation

### For Administrators

1. **Moderation** - Approve/reject listings
2. **Verification** - Verify user documents
3. **Analytics** - Monitor system health
4. **Users** - Manage user accounts
5. **Content** - Update static content
6. **Reports** - Generate system reports

---

## 🌍 Localization Support

### Supported Divisions (Divisions of Bangladesh)

- Dhaka
- Chattagram
- Khulna
- Rajshahi
- Barisal
- Sylhet
- Rangpur
- Mymensingh

### District & Upazila Support

- Complete mapping for all districts
- Sub-district support for precise location
- Area codes and postal data

---

## 🤖 AI Integration Details

### Groq API Integration

```javascript
// Property description generation
const response = await groq.chat.completions.create({
  model: "mixtral-8x7b-32768",
  messages: [
    {
      role: "user",
      content: propertyPrompt,
    },
  ],
  temperature: 0.7,
  max_tokens: 1024,
});
```

### AI Features

- **Auto Description Generation** - Create compelling descriptions
- **Price Estimation** - Suggest property prices
- **Recommendation Engine** - Suggest properties to users
- **Chatbot Support** - Future FAQ bot

---

## 💼 Performance Metrics

### Optimization Goals

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Chat Latency**: < 100ms
- **Database Query Time**: < 100ms
- **Search Results**: < 50ms

### Current Optimizations

- ✅ Indexed database queries
- ✅ Image lazy loading
- ✅ Code splitting in frontend
- ✅ Caching strategies
- ✅ Compressed responses
- ✅ CDN for static assets

---

## 📧 Email Templates

### Notification Types

- Welcome email
- Property listing approved
- New application received
- Message notification
- Verification reminder
- Password reset
- Account deactivation

---

## 🔄 Continuous Integration/Deployment

### Automated Testing

```bash
# Run tests before deployment
npm test
npm run lint
npm run type-check
```

### Deployment Checklist

- [ ] All tests pass
- [ ] No linting errors
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated

---

## 📞 Get Help

### Where to Ask Questions

| Platform           | Best For                       |
| ------------------ | ------------------------------ |
| **GitHub Issues**  | Bug reports, feature requests  |
| **Discussions**    | General questions, discussions |
| **Stack Overflow** | Technical/coding questions     |
| **Email**          | Direct support inquiries       |

### Creating a Good Issue

```markdown
## Description

Brief description of the issue

## Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

## Expected Behavior

What should happen

## Actual Behavior

What actually happened

## Environment

- OS: Windows/Mac/Linux
- Node Version: 18.0.0
- Browser: Chrome 120
- Additional info
```

---

## 🚀 Performance Monitoring

### Backend Monitoring

```javascript
// Simple request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

### Frontend Monitoring

```javascript
// Performance metrics
window.addEventListener("load", () => {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log("Page Load Time:", pageLoadTime);
});
```

---

## 🎓 Learning Paths

### Beginner

1. Understand MERN stack basics
2. Learn MongoDB fundamentals
3. Study Firebase authentication
4. Explore React hooks and state management

### Intermediate

1. Master REST API design
2. Implement real-time features with Socket.io
3. Learn advanced MongoDB queries
4. Understand async/await patterns

### Advanced

1. Optimize database performance
2. Implement caching strategies
3. Master security practices
4. Build scalable architectures

---

## 📊 Data Flow Diagrams

### User Authentication Flow

```
User → Frontend → Firebase Auth → Backend → Database
                     ↓
                  Token Generated
                     ↓
                Frontend Store
```

### Property Listing Flow

```
Owner → Create Property → AI Description Generated →
  Admin Review → Approved → Listed → Searchable
```

### Real-Time Chat Flow

```
User A → Socket.io Server → Message Stored → User B
         ↓
      Notification Triggered
```

---

## 💡 Code Examples

### Create a Property (Backend)

```javascript
// propertyController.js
exports.createProperty = async (req, res) => {
  try {
    const { title, price, location } = req.body;
    const userId = req.user.uid;

    // Validate input
    if (!title || !price || !location) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Create property
    const property = new Property({
      title,
      price,
      location,
      ownerId: userId,
      status: "pending",
    });

    await property.save();
    res.json({ property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Fetch Properties (Frontend)

```javascript
// useProperties.js hook
const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = async (filters) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/properties", {
        params: filters,
      });
      setProperties(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, fetchProperties };
};
```

---

## 🎉 Acknowledgments

This project was built with passion for the Bangladesh real estate community. Special thanks to:

- MongoDB for powerful database solutions
- Firebase for seamless authentication
- Groq for AI capabilities
- The open-source community

---

## 📝 Version History

### v1.0.0 (Current)

- Initial release
- Core features implemented
- Full documentation

### Upcoming v1.1.0

- Enhanced search filters
- Mobile app support
- Payment integration

### Future Versions

- Advanced analytics
- Virtual tours
- Machine learning recommendations

---

## 🔗 Quick Links

- [GitHub Repository](https://github.com/khandakeraliariyan/GHOR_BARI)
- [Live Demo](#) - Coming Soon
- [Project Issues](#)
- [Contributing Guide](#)
- [Code of Conduct](#)

---

**Last Updated**: March 2026  
**Maintained by**: Khandaker Ali Ariyan  
**License**: ISC

- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests

1. Check if feature exists
2. Create issue with:
   - Clear title
   - Detailed description
   - Use cases and benefits
   - Possible implementation

---

<div align="center">

### Built with ❤️ for Bangladesh Real Estate

[⬆ back to top](#-ghor-bari---property-rental--listing-platform)

</div>

## 📁 Project Structure

```
GHOR_BARI/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── firebase.js        # Firebase configuration
│   │   │   └── socket.js          # Socket.io setup
│   │   ├── controllers/           # Business logic
│   │   │   ├── adminController.js
│   │   │   ├── applicationController.js
│   │   │   ├── chatController.js
│   │   │   ├── comparisonController.js
│   │   │   ├── propertyController.js
│   │   │   └── userController.js
│   │   ├── models/                # MongoDB schemas
│   │   │   ├── Chat.js
│   │   │   └── Comparison.js
│   │   ├── routes/                # API endpoints
│   │   │   ├── adminRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── comparisonRoutes.js
│   │   │   ├── propertyRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/            # Custom middleware
│   │   │   ├── verifyAdmin.js
│   │   │   ├── verifyOwner.js
│   │   │   ├── verifyPropertyOwner.js
│   │   │   └── verifyToken.js
│   │   └── events/
│   │       └── chatEvents.js
│   ├── server.js                  # Server entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── Router.jsx             # Route configuration
│   │   ├── index.css              # Global styles
│   │   ├── Components/            # Reusable components
│   │   │   ├── Banner.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── NavBar.jsx
│   │   │   └── ...
│   │   ├── Pages/                 # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── AdminDashboard/
│   │   │   ├── BuyOrRentPage/
│   │   │   ├── ChatPage/
│   │   │   ├── ListPropertyPage/
│   │   │   ├── ProfilePage/
│   │   │   ├── PropertyDetails/
│   │   │   └── ...
│   │   ├── context/               # React Context
│   │   │   └── ChatContext.jsx
│   │   ├── Firebase/              # Firebase configuration
│   │   │   ├── AuthProvider.jsx
│   │   │   └── firebase.config.js
│   │   ├── Hooks/                 # Custom React hooks
│   │   │   ├── useAuth.jsx
│   │   │   ├── useAdmin.jsx
│   │   │   ├── useAxios.jsx
│   │   │   ├── useChat.jsx
│   │   │   ├── useRole.jsx
│   │   │   └── useSocket.jsx
│   │   ├── Layouts/               # Layout components
│   │   │   ├── HomeLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── Utilities/             # Helper functions
│   │   │   ├── ChatHelpers.js
│   │   │   ├── socketClient.js
│   │   │   └── UploadImage.js
│   │   └── PrivateRoute/          # Protected routes
│   │       ├── PrivateRoute.jsx
│   │       └── AdminRoute.jsx
│   ├── public/                    # Static assets
│   │   ├── districts.json
│   │   ├── divisions.json
│   │   └── upzillas.json
│   ├── vite.config.js             # Vite configuration
│   ├── eslint.config.js           # ESLint configuration
│   ├── index.html
│   └── package.json
│
├── LICENSE
└── README.md
```

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Firebase project with credentials

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in backend directory with required variables (see Configuration section)

### Frontend Setup

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in client directory with Firebase configuration

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_SERVER_URL=http://localhost:5000
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Download service account key and place it as `ghor-bari-firebase-admin-sdk.json` in backend directory
4. Get web app credentials for frontend

## 🚀 Running the Application

### Development Mode

**Backend:**

```bash
cd backend
npm start
```

Server runs on `http://localhost:5000`

**Frontend:**

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173` (default Vite port)

### Production Build

**Frontend:**

```bash
cd client
npm run build
```

## 📚 API Documentation

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Routes

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Property Routes

- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Chat Routes

- `GET /api/chats` - Get user's conversations
- `GET /api/chats/:id` - Get conversation messages
- `POST /api/chats` - Create new conversation
- `POST /api/chats/:id/messages` - Send message

### Admin Routes

- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/properties` - Pending properties
- `PUT /api/admin/properties/:id/approve` - Approve property
- `PUT /api/admin/users/:id/verify` - Verify user

## 🏗️ Project Architecture

### Frontend Architecture

- **Component-based**: Modular, reusable React components
- **Context API**: State management for authentication and chat
- **Custom Hooks**: Encapsulated logic for API calls, authentication, and sockets
- **Private Routes**: Protected pages with role-based access

### Backend Architecture

- **MVC Pattern**: Models, Controllers, Routes structure
- **Middleware**: Request validation and authentication
- **Socket.io**: Real-time events for chat functionality
- **Firebase Integration**: User authentication and token verification

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/YourFeature`
2. Commit your changes: `git commit -m 'Add YourFeature'`
3. Push to the branch: `git push origin feature/YourFeature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
