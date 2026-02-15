# Ghor Bari - Property Rental & Listing Platform

A full-stack web application for buying, renting, and managing property listings with real-time chat functionality and admin dashboard.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Features
- **Property Listings**: Browse and search properties with filtering options
- **Real-time Chat**: Direct messaging between property owners and potential buyers/renters
- **User Authentication**: Secure login and registration with Firebase
- **Property Comparison**: Compare multiple properties side by side
- **Property Details**: Comprehensive property information with images and location mapping
- **User Profiles**: Manage user information and saved properties
- **Location-based Search**: Filter properties by division, district, and upzilla (Bangladesh regions)

### Property Management
- **List Properties**: Property owners can add new property listings
- **Edit Listings**: Modify property details and images
- **Application Management**: Track applications from interested buyers/renters
- **Property Status**: Publish or unpublish listings

### Admin Features
- **User Management**: View and manage all users
- **Property Moderation**: Approve/reject pending property listings
- **User Verification**: Verify user profiles
- **System Overview**: Dashboard with statistics and analytics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Firebase Auth** - Authentication service
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Firebase** - Admin SDK for authentication and services
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Token-based authentication

### Tools & Services
- **Vite** - Development server and bundler
- **ESLint** - Code linting

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
# Optional: for Ghor AI (Gemini) on Buy/Rent page - get key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
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