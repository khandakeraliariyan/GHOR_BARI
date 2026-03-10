# 🏠 Ghor Bari - Property Rental & Listing Platform

<div align="center">

A comprehensive full-stack web application for buying, renting, and managing property listings in Bangladesh with real-time chat functionality, AI-powered property descriptions, and advanced admin dashboard.

**Live Website:** https://ghor-bari-2c93a.web.app/

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Configuration](#-configuration) • [API Docs](#-api-documentation) • [Architecture](#-project-architecture)

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
- 🧠 **Ghor Bari AI Assistant**: Hybrid property matching from platform listings with advisory responses
- ✅ **Verification System**: NID-based user verification for trust
- 📧 **Queued Email Notifications**: Background delivery for deal and application lifecycle updates
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
- AI chat-assisted property discovery with direct property navigation
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
- Counter offers, revised offers, and deal completion/cancellation workflow
- Direct communication with applicants

#### 📧 **Notification Delivery**

- Queued email jobs for application and deal events
- Retry handling for failed deliveries
- Background processing through cron or secured internal endpoint

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
INTERNAL_CRON_SECRET=your-internal-secret
EMAIL_JOB_BATCH_SIZE=10
```

Note: the current backend code reads `MONGO_URI` for the database connection. Keep `MONGO_URI` and `MONGODB_URI` aligned if both are present in your local setup.

### Frontend .env

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_SERVER_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

Note: the current AI/chat client uses `VITE_API_URL` as the primary API base URL.

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

**Featured Properties**

```http
GET /featured-properties
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

### AI Endpoints

**Send Message To Ghor Bari AI**

```http
POST /api/ai/send-message
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "message": "Find me a flat in Gazipur under 30000"
}
```

Response includes normalized text plus optional `matchedProperties` used by the chat UI to render clickable property cards.

**Generate Property Description**

```http
POST /api/ai/generate-property-description
Authorization: Bearer <firebase_token>
```

**Estimate Property Price**

```http
POST /api/ai/estimate-property-price
Authorization: Bearer <firebase_token>
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

### Public/Internal Utility Endpoints

**Public Stats**

```http
GET /public/stats
```

**Process Queued Email Jobs**

```http
POST /internal/process-email-jobs
x-internal-cron-secret: <INTERNAL_CRON_SECRET>
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
- Dedupe key and notification read state

---

## 💬 Real-Time Features

### Socket.io Events

**Client → Server:**

- `chat:join`: Join a conversation room
- `chat:leave`: Leave a conversation room
- `message:send`: Send a message
- `typing:start`: Start typing indicator
- `typing:stop`: Stop typing indicator
- `message:markRead`: Mark conversation messages as read
- `users:getOnline`: Request online users list

**Server → Client:**

- `chat:joined`: Room join acknowledgement
- `message:received`: New message broadcast
- `typing:active`: Typing state updates
- `message:read`: Read receipt update
- `users:online`: Connected users list

### Background Jobs

- `emailJobCron`: Processes queued notification emails on a schedule
- `nidVerificationCron`: Runs pending NID verification processing

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
