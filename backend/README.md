# Backend (MERN)

A **Node.js + Express + MongoDB** backend for **GhorBari**, a smart property listing and rental platform. This backend powers authentication, NID verification, property listings, search & filter, wishlist, real-time chat, rating system, and admin moderation.

---

## 🚀 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB (Mongoose)**
* **JWT Authentication**
* **Socket.io** (Real-time chat)
* **bcryptjs** (Password hashing)

---

## 📂 Project Structure

```
backend/
│── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Message.js
│   │   └── Review.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── nidController.js
│   │   ├── propertyController.js
│   │   ├── wishlistController.js
│   │   ├── chatController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── nidRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   └── middleware/
│       ├── authMiddleware.js
│       ├── roleMiddleware.js
│       └── blockMiddleware.js
│── .env
│── package.json
│── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## ▶️ Installation & Run

```bash
npm install
npm run dev
```

Server will run at:

```
http://localhost:5000
```

---

## 🔐 Authentication & Roles

### Roles

* **seeker** (default)
* **owner**
* **admin**

### Auth Features

* JWT-based authentication
* Password hashing using bcrypt
* Role-based authorization middleware

---

## 📌 API Endpoints

### 🔑 Auth

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |

---

### 🆔 NID Verification

| Method | Endpoint         | Access | Description          |
| ------ | ---------------- | ------ | -------------------- |
| POST   | /api/nid/submit  | User   | Submit NID info      |
| GET    | /api/nid/pending | Admin  | View pending NIDs    |
| PUT    | /api/nid/update  | Admin  | Approve / reject NID |

---

### 🏠 Properties

| Method | Endpoint            | Access | Description                          |
| ------ | ------------------- | ------ | ------------------------------------ |
| GET    | /api/properties     | Public | Get all properties (search & filter) |
| GET    | /api/properties/:id | Public | Get property by ID                   |
| POST   | /api/properties     | Owner  | Create property (verified only)      |
| PUT    | /api/properties/:id | Owner  | Update property                      |
| DELETE | /api/properties/:id | Owner  | Delete property                      |

#### Search & Filter Examples

```
/api/properties?location=dhaka
/api/properties?minPrice=10000&maxPrice=20000
/api/properties?rooms=2
```

---

### ❤️ Wishlist

| Method | Endpoint                  | Access | Description         |
| ------ | ------------------------- | ------ | ------------------- |
| POST   | /api/wishlist/:propertyId | User   | Add/remove wishlist |
| GET    | /api/wishlist             | User   | View wishlist       |

---

### 💬 Chat (Real-time + REST)

| Method | Endpoint          | Access | Description      |
| ------ | ----------------- | ------ | ---------------- |
| GET    | /api/chat/:userId | User   | Get chat history |

**Socket.io Events**

* `join` → join user room
* `sendMessage` → send message
* `receiveMessage` → receive message

---

### ⭐ Ratings & Reviews

| Method | Endpoint             | Access | Description       |
| ------ | -------------------- | ------ | ----------------- |
| POST   | /api/reviews         | User   | Rate another user |
| GET    | /api/reviews/:userId | Public | Get user reviews  |

---

### 🛠 Admin Panel

| Method | Endpoint                                  | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| GET    | /api/admin/users                          | View all users             |
| PUT    | /api/admin/users/:userId/block            | Block/unblock user         |
| GET    | /api/admin/properties                     | View all properties        |
| PUT    | /api/admin/properties/:propertyId/approve | Approve/unapprove property |

---

## 🔒 Security Features

* JWT authentication
* Role-based access control
* NID verification before listing
* Admin moderation

---

## 🎓 Academic Notes

* Rule-based logic used where applicable
* Modular & scalable backend architecture
* Designed for MERN-based university project

---

## 👨‍💻 Author

Khandaker Ali Ariyan 

---
