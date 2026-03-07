# 🎨 Frontend - Ghor Bari Client Documentation

Comprehensive documentation for the Ghor Bari frontend application built with React, Vite, and TailwindCSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Component Architecture](#component-architecture)
- [Custom Hooks](#custom-hooks)
- [State Management](#state-management)
- [Firebase Authentication](#firebase-authentication)
- [Real-Time Features](#real-time-features)
- [Styling](#styling)
- [Build & Optimization](#build--optimization)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Ghor Bari frontend is a modern React application providing users with an intuitive interface to search, list, and manage properties. It features real-time chat, property comparison, wishlist functionality, and a comprehensive admin dashboard.

### Key Features

- **Property Search**: Advanced filtering and search capabilities
- **User Authentication**: Firebase-based login/signup
- **Real-Time Chat**: Socket.io powered messaging
- **Property Listing**: Create and manage property listings
- **Admin Dashboard**: Comprehensive property and user management
- **Responsive Design**: Mobile-first TailwindCSS styling
- **Fast Performance**: Vite-powered development and builds
- **Dark Mode**: Theme switching support
- **PWA Ready**: Progressive Web App capabilities

---

## 🛠️ Tech Stack

| Component            | Technology        | Version  | Purpose                 |
| -------------------- | ----------------- | -------- | ----------------------- |
| **Runtime**          | Node.js           | 18+ LTS  | JavaScript runtime      |
| **Package Manager**  | npm               | 9+       | Dependency management   |
| **Framework**        | React             | 18.x     | UI library              |
| **Build Tool**       | Vite              | 4.x      | Next-gen build tool     |
| **Styling**          | TailwindCSS       | 3.x      | Utility-first CSS       |
| **HTTP Client**      | Axios             | 1.7.7    | API requests            |
| **Real-Time**        | Socket.io Client  | 4.x      | WebSocket communication |
| **Authentication**   | Firebase SDK      | 10.x     | Client-side auth        |
| **Routing**          | React Router      | 6.x      | Client-side routing     |
| **State Management** | Context API       | Built-in | Global state            |
| **Form Validation**  | JavaScript        | Native   | Input validation        |
| **Icons**            | React Icons       | 4.x      | Icon library            |
| **Animation**        | CSS/Framer Motion | -        | UI animations           |
| **UI Components**    | Custom            | -        | Reusable components     |

---

## 📁 Project Structure

```
client/
├── 📄 index.html                          # HTML entry point
├── 📄 vite.config.js                      # Vite configuration
├── 📄 package.json                        # Project dependencies
├── 📄 tailwind.config.js                  # TailwindCSS config
├── 📄 postcss.config.js                   # PostCSS config
├── 📄 .env                                # Environment variables
├── 📄 .env.example                        # Environment template
├── 📄 eslint.config.js                    # Code quality rules
│
├── 📁 public/                             # Static assets
│   ├── 📁 images/                         # Image assets
│   ├── 📁 icons/                          # Icon assets
│   ├── 📄 bangladeshAdministrativeData.js # Location data
│   ├── 📄 bangladeshAdministrativeData.json
│   ├── 📄 districts-new.json
│   ├── 📄 districts.json
│   ├── 📄 divisions.json
│   ├── 📄 thanas.json
│   └── 📄 upzillas.json
│
└── 📁 src/
    ├── 📄 index.css                       # Global styles
    ├── 📄 main.jsx                        # Entry point
    ├── 📄 Router.jsx                      # Route definitions
    │
    ├── 📁 assets/                         # Static files
    │   ├── 📁 images/
    │   ├── 📁 videos/
    │   └── 📁 documents/
    │
    ├── 📁 Components/                     # Reusable components
    │   ├── 📄 Banner.jsx                  # Hero banner
    │   ├── 📄 NavBar.jsx                  # Navigation
    │   ├── 📄 Footer.jsx                  # Footer
    │   ├── 📄 Loading.jsx                 # Loading spinner
    │   ├── 📄 FeaturedProperties.jsx      # Property showcase
    │   ├── 📄 GhorAI.jsx                  # AI chat component
    │   ├── 📄 WishlistNoteModal.jsx       # Wishlist modal
    │   ├── 📄 MapPicker.jsx               # Location picker
    │   ├── 📄 BeginYourPropertyJourney.jsx # CTA section
    │   ├── 📄 FAQSection.jsx              # FAQ component
    │   ├── 📄 WhyChooseUs.jsx             # Marketing section
    │   └── 📄 HomePageStats.jsx           # Statistics display
    │
    ├── 📁 context/                        # State management
    │   ├── 📄 ChatContext.jsx             # Chat state
    │   ├── 📄 ComparisonContext.jsx       # Comparison state
    │   ├── 📄 WishlistContext.jsx         # Wishlist state
    │   └── 📄 WishlistContextValue.js     # State values
    │
    ├── 📁 Firebase/                       # Firebase setup
    │   ├── 📄 firebase.config.js          # Firebase config
    │   └── 📄 AuthProvider.jsx            # Auth context
    │
    ├── 📁 Hooks/                          # Custom React hooks
    │   ├── 📄 useAdmin.jsx                # Admin check hook
    │   ├── 📄 useAuth.jsx                 # Auth hook
    │   ├── 📄 useFetch.jsx                # Data fetching hook
    │   ├── 📄 useLocalStorage.jsx         # LocalStorage hook
    │   └── 📄 useSocket.jsx               # Socket.io hook
    │
    ├── 📁 Layouts/                        # Layout components
    │   ├── 📄 MainLayout.jsx              # Main layout
    │   ├── 📄 AdminLayout.jsx             # Admin layout
    │   └── 📄 AuthLayout.jsx              # Auth layout
    │
    ├── 📁 Pages/                          # Page components
    │   ├── 📄 Home.jsx                    # Home page
    │   ├── 📄 Properties.jsx              # Properties listing
    │   ├── 📄 PropertyDetail.jsx          # Property details
    │   ├── 📄 Login.jsx                   # Login page
    │   ├── 📄 Register.jsx                # Registration page
    │   ├── 📄 Dashboard.jsx               # User dashboard
    │   ├── 📄 AdminDashboard.jsx          # Admin dashboard
    │   ├── 📄 Chat.jsx                    # Chat page
    │   ├── 📄 Wishlist.jsx                # Wishlist page
    │   ├── 📄 MyProperties.jsx            # User properties
    │   ├── 📄 CreateProperty.jsx          # Create listing
    │   ├── 📄 EditProperty.jsx            # Edit listing
    │   ├── 📄 UserProfile.jsx             # User profile
    │   ├── 📄 AdminUsers.jsx              # Admin users page
    │   ├── 📄 AdminProperties.jsx         # Admin properties page
    │   ├── 📄 NotFound.jsx                # 404 page
    │   └── 📄 ErrorBoundary.jsx           # Error handling
    │
    ├── 📁 PrivateRoute/                   # Route protection
    │   ├── 📄 PrivateRoute.jsx            # Auth guard
    │   └── 📄 AdminRoute.jsx              # Admin guard
    │
    └── 📁 Utilities/                      # Helper functions
        ├── 📄 api.js                      # API client
        ├── 📄 validation.js               # Form validation
        ├── 📄 formatters.js               # Data formatting
        ├── 📄 constants.js                # App constants
        ├── 📄 helpers.js                  # Utility helpers
        └── 📄 errorHandler.js             # Error handling
```

---

## 📦 Setup & Installation

### Prerequisites

```bash
# Verify versions
node --version     # Should be v18+
npm --version      # Should be v9+
git --version      # Any recent version
```

### Installation Steps

#### 1. Clone and Navigate

```bash
git clone https://github.com/khandakeraliariyan/GHOR_BARI.git
cd GHOR_BARI/client
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
# Edit .env with your configuration
```

#### 4. Configure Firebase

Add your Firebase credentials to `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# ========== FIREBASE ==========
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=ghor-bari-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ghor-bari-xxxx
VITE_FIREBASE_STORAGE_BUCKET=ghor-bari-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# ========== API ==========
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# ========== APP ==========
VITE_APP_NAME=Ghor Bari
VITE_NODE_ENV=development
```

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or select project
3. Go to Project Settings
4. Copy Web SDK configuration
5. Add to `.env` with `VITE_` prefix

### Vite Configuration

`vite.config.js`:

```javascript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictSSL: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
```

### TailwindCSS Configuration

`tailwind.config.js`:

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
      },
    },
  },
  plugins: [],
};
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# Runs on http://localhost:3000
# Hot Module Replacement (HMR) enabled
# Watch mode for all changes
```

### Production Build

```bash
npm run build
# Creates optimized build in dist/ folder
# Minified and bundled
```

### Preview Production Build

```bash
npm run preview
# Serves built version locally
# Tests production build
```

### Available Scripts

```bash
npm run dev         # Development server with HMR
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint code checking
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Check formatting
npm run format:fix  # Auto-format code
npm run analyze     # Bundle size analysis
```

---

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Layouts
│   │   ├── MainLayout
│   │   │   ├── NavBar
│   │   │   ├── Routes
│   │   │   └── Footer
│   │   ├── AdminLayout
│   │   │   ├── Sidebar
│   │   │   ├── AdminRoutes
│   │   │   └── AdminNav
│   │   └── AuthLayout
│   │       ├── AuthRoutes
│   │       └── AuthBackground
│   │
│   ├── PublicPages
│   │   ├── Home
│   │   │   ├── Banner
│   │   │   ├── FeaturedProperties
│   │   │   ├── HomePageStats
│   │   │   ├── WhyChooseUs
│   │   │   ├── FAQSection
│   │   │   └── BeginYourPropertyJourney
│   │   │
│   │   ├── Properties (Listing)
│   │   │   ├── FilterSidebar
│   │   │   ├── PropertyCard[] (mapped)
│   │   │   └── Pagination
│   │   │
│   │   ├── PropertyDetail
│   │   │   ├── ImageGallery
│   │   │   ├── PropertyInfo
│   │   │   ├── ContactLandlord
│   │   │   ├── SimilarProperties
│   │   │   └── Reviews
│   │   │
│   │   ├── Login
│   │   └── Register
│   │
│   ├── PrivateRoutes (Protected)
│   │   ├── Chat
│   │   │   ├── ConversationList
│   │   │   └── ChatWindow
│   │   │
│   │   ├── Dashboard
│   │   │   ├── UserProfile
│   │   │   ├── MyProperties
│   │   │   ├── Applications
│   │   │   └── Wishlist
│   │   │
│   │   ├── Wishlist
│   │   ├── MyProperties
│   │   ├── CreateProperty
│   │   └── UserSettings
│   │
│   └── AdminRoutes (Admin Only)
│       ├── AdminDashboard
│       │   ├── Statistics
│       │   ├── RecentActivities
│       │   └── Metrics
│       ├── AdminUsers
│       ├── AdminProperties
│       └── AdminSettings
│
└── GhorAI (Chat widget - floating)
```

### Component Types

**Page Components**: Full-page layouts

```javascript
// src/Pages/Home.jsx
function Home() {
  return (
    <MainLayout>
      <Banner />
      <FeaturedProperties />
      {/* ... */}
    </MainLayout>
  );
}
```

**Layout Components**: Wrap page content

```javascript
// src/Layouts/MainLayout.jsx
function MainLayout({ children }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

**Feature Components**: Reusable features

```javascript
// src/Components/PropertyCard.jsx
function PropertyCard({ property, onWishlist }) {
  return <div className="card">{/* Property details */}</div>;
}
```

---

## 🎣 Custom Hooks

### useAuth

```javascript
// src/Hooks/useAuth.jsx
const { user, loading, logout } = useAuth();
```

**Returns**: `{ user, loading, logout, login, register }`

### useFetch

```javascript
// Fetch data with loading and error states
const { data, loading, error } = useFetch("/api/properties");
```

**Returns**: `{ data, loading, error, refetch }`

### useLocalStorage

```javascript
// Persist data to localStorage
const [value, setValue] = useLocalStorage("key", null);
```

**Returns**: `[value, setValue]`

### useSocket

```javascript
// Socket.io connection handler
const socket = useSocket();

useEffect(() => {
  socket.emit("event_name", data);
  socket.on("event_response", handleResponse);
}, [socket]);
```

**Returns**: `SocketIOClient`

### useAdmin

```javascript
// Check if user is admin
const isAdmin = useAdmin();
```

**Returns**: `boolean`

---

## 🗂️ State Management

### Context API

**Chat Context** (`src/context/ChatContext.jsx`):

```javascript
// Manage chat state
const { conversations, messages, sendMessage } = useContext(ChatContext);
```

**Wishlist Context** (`src/context/WishlistContext.jsx`):

```javascript
// Manage wishlist
const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
```

**Comparison Context** (`src/context/ComparisonContext.jsx`):

```javascript
// Compare properties
const { comparing, addCompare, removeCompare } = useContext(ComparisonContext);
```

### Best Practices

1. Keep context focused on single domain
2. Use custom hooks to access context
3. Memoize context values to prevent unnecessary renders
4. Use useCallback for callback functions

---

## 🔐 Firebase Authentication

### Setup

Configuration in `src/Firebase/firebase.config.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
```

### Auth Flow

```javascript
// src/Firebase/AuthProvider.jsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Register/update user in database
        await registerUserInDB(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
```

### Login Example

```javascript
async function handleLogin(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Get ID token
    const token = await result.user.getIdToken();
    // Use token in API calls
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}
```

### Register Example

```javascript
async function handleRegister(email, password, userData) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Register user in database
    await axios.post("/api/users/register-user", {
      email: result.user.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
    });
  } catch (error) {
    console.error("Registration failed:", error.message);
  }
}
```

---

## 💬 Real-Time Features

### Socket.io Integration

```javascript
// src/Utilities/socket.js
import io from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

### Chat Usage

```javascript
// useSocket hook
const socket = useSocket();

// Send message
const sendMessage = (conversationId, message) => {
  socket.emit("send_message", { conversationId, message });
};

// Receive message
useEffect(() => {
  socket.on("receive_message", (message) => {
    setMessages((prev) => [...prev, message]);
  });
}, [socket]);

// Typing indicator
const showTyping = (conversationId) => {
  socket.emit("typing", { conversationId });
};
```

---

## 🎨 Styling

### TailwindCSS Classes

```jsx
// Cards
<div className="rounded-lg shadow-lg bg-white p-6">
  {/* Card content */}
</div>

// Buttons
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
  Click me
</button>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Flexbox
<div className="flex items-center justify-between space-x-4">
  {/* Content */}
</div>
```

### Custom CSS

Global styles in `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

---

## 🔨 Build & Optimization

### Production Build

```bash
npm run build

# Output in dist/ folder
# Files minified and bundled
# Tree-shaking enabled
# Code splitting applied
```

### Bundle Analysis

```bash
npm run analyze
# Visualize bundle size
# Identify large dependencies
```

### Performance Optimization

- **Code Splitting**: Route-based code splitting

```javascript
const Home = React.lazy(() => import("./Pages/Home"));
```

- **Image Optimization**: Use WebP format

```jsx
<img src="image.webp" alt="description" loading="lazy" />
```

- **Component Memoization**:

```javascript
const PropertyCard = React.memo(function PropertyCard({ property }) {
  return <div>{property.title}</div>;
});
```

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import GitHub repository

2. **Configure Environment**
   - Add environment variables
   - Set Node version to 18

3. **Framework Settings**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

4. **Deploy**
   - Click Deploy
   - Vercel generates domain

### GitHub Pages Deployment

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Update package.json
{
  "homepage": "https://yourusername.github.io/ghor-bari",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# Deploy
npm run deploy
```

### Netlify Deployment

1. Build locally: `npm run build`
2. Drag `dist` folder to Netlify
3. Or connect GitHub and auto-deploy

---

## 👨‍💻 Development Workflow

### Development Process

1. **Create Feature Branch**

```bash
git checkout -b feature/new-feature
```

2. **Start Dev Server**

```bash
npm run dev
```

3. **Develop & Test**
   - Write component
   - Test in browser
   - Check responsiveness

4. **Code Quality**

```bash
npm run lint
npm run format:fix
```

5. **Build & Test**

```bash
npm run build
npm run preview
```

6. **Commit & Push**

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

7. **Create Pull Request**

### File Naming Conventions

- **Components**: PascalCase (e.g., `PropertyCard.jsx`)
- **Pages**: PascalCase (e.g., `Home.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`)
- **Utilities**: camelCase (e.g., `formatters.js`)
- **CSS Classes**: kebab-case

---

## 🆘 Troubleshooting

### Common Issues

#### Port 3000 Already in Use

```bash
# Kill process using port
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

#### Firebase Connection Error

- Verify `.env` variables
- Check Firebase project exists
- Verify API key in console

#### Hot Module Replacement (HMR) Not Working

```bash
# Restart dev server
# Kill: Ctrl+C
npm run dev
```

#### Build Fails

```bash
# Check Node version
node --version  # Should be 18+

# Try clean build
rm -rf dist
npm run build

# Check for syntax errors
npm run lint
```

#### API Connection Error

Make sure backend is running:

```bash
cd ../backend
npm run dev
```

Verify `VITE_API_URL` in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 Useful Resources

### Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)

### Learning Resources

- [React Best Practices](https://react.dev/learn)
- [Tailwind Component Library](https://tailwindui.com)
- [Vite Plugins](https://vitejs.dev/plugins/)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests and lint
5. Push and create PR
6. Wait for review

---

**Last Updated**: March 2026

**Version**: 1.0.0

**Maintainer**: Khandaker Aliariyan
