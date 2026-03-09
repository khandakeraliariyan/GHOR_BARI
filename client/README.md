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
# Server runs on http://localhost:5173
# HMR (Hot Module Replacement) enabled
# Open browser to http://localhost:5173
```

### Production Build

```bash
npm run build
# Creates optimized build in dist/ folder
# All assets minified and code-split

npm run preview
# Preview production build locally
```

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix lint errors
npm run format           # Check formatting
npm run format:write     # Auto-format code
npm run test             # Run tests
npm run test:coverage    # Coverage report
```

---

## 🏗️ Component Architecture

### Component Hierarchy

```
App
├── AuthProvider (Firebase)
├── Router
│   ├── MainLayout
│   │   ├── NavBar
│   │   ├── Routes
│   │   │   ├── Home
│   │   │   ├── Properties
│   │   │   ├── PropertyDetail
│   │   │   ├── Chat
│   │   │   ├── Wishlist
│   │   │   └── [PrivateRoute]
│   │   └── Footer
│   ├── AdminLayout
│   │   ├── AdminNav
│   │   ├── AdminRoutes
│   │   │   ├── AdminDashboard
│   │   │   ├── AdminUsers
│   │   │   └── AdminProperties
│   │   └── AdminFooter
│   └── AuthLayout
│       ├── Login
│       └── Register
└── Toast Provider
```

### Component Patterns

#### Functional Component with Hooks

```javascript
import { useState, useEffect } from "react";
import { useAuth } from "../Hooks/useAuth";

const PropertyCard = ({ propertyId, onDelete }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      setProperty(await response.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!property) return <div>Not found</div>;

  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <p>{property.description}</p>
      <button onClick={() => onDelete(propertyId)}>Delete</button>
    </div>
  );
};

export default PropertyCard;
```

#### Context Consumer Component

```javascript
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const ChatWindow = () => {
  const { messages, sendMessage } = useContext(ChatContext);

  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div key={msg.id} className="message">
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
```

---

## 🎣 Custom Hooks Deep Dive

### useAuth Hook

```javascript
// src/Hooks/useAuth.jsx
import { useContext } from "react";
import { AuthContext } from "../Firebase/AuthProvider";

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default useAuth;
```

**Usage:**

```javascript
const { user, loading, login, logout } = useAuth();
```

### useFetch Hook

```javascript
// src/Hooks/useFetch.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          ...options,
        });
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
```

**Usage:**

```javascript
const { data: properties, loading, error } = useFetch("/api/properties");
```

### useSocket Hook

```javascript
// src/Hooks/useSocket.jsx
import { useEffect } from "react";
import io from "socket.io-client";

const useSocket = () => {
  useEffect(() => {
    const socket = io(process.env.VITE_SOCKET_URL);

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => socket.disconnect();
  }, []);
};

export default useSocket;
```

---

## 🎨 TailwindCSS & Styling

### Global Styles

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .input-base {
    @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

### Responsive Design Breakpoints

```javascript
// Tailwind breakpoints
const breakpoints = {
  sm: "640px", // Small devices
  md: "768px", // Medium devices (tablets)
  lg: "1024px", // Large devices
  xl: "1280px", // Extra large
  "2xl": "1536px", // Ultra large
};
```

### Theme Configuration

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0066FF",
        secondary: "#64748B",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("daisyui")],
};
```

---

## 🔐 State Management Patterns

### Context API Implementation

```javascript
// src/context/PropertyContext.jsx
import { createContext, useState, useCallback } from "react";

export const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    listingType: "",
    priceMin: 0,
    priceMax: 100000,
  });
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/properties?" + new URLSearchParams(filters));
      setProperties(await response.json());
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const value = {
    properties,
    filters,
    loading,
    fetchProperties,
    updateFilters,
  };

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
};
```

---

## 🚀 Build Optimization & Performance

### Vite Optimization

```javascript
// vite.config.js for production
export default {
  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "axios"],
          firebase: ["firebase/app", "firebase/auth"],
          ui: ["tailwindcss", "daisyui"],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
};
```

### Code Splitting

```javascript
// Route-based code splitting with React.lazy
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./Pages/Home"));
const Properties = lazy(() => import("./Pages/Properties"));
const AdminDashboard = lazy(() => import("./Pages/AdminDashboard"));

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
    </Routes>
  </Suspense>
);
```

### Image Optimization

```javascript
// Lazy loading images on scroll
const LazyImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity`}
      loading="lazy"
    />
  );
};
```

---

## 🔍 Performance Monitoring

### Lighthouse Metrics

```javascript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Performance Timing

```javascript
// Measure component render time
useEffect(() => {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    console.log(`Component rendered in ${endTime - startTime}ms`);
  };
}, []);
```

---

## ♿ Accessibility Guidelines

### ARIA Attributes

```jsx
<button
  onClick={handleDelete}
  aria-label="Delete property"
  aria-describedby="delete-hint"
  disabled={!canDelete}
>
  Delete
</button>
<p id="delete-hint">This action cannot be undone</p>
```

### Semantic HTML

```jsx
<section>
  <h1>Properties</h1>
  <article>
    <h2>Property Title</h2>
    <p>Description</p>
  </article>
</section>
```

### Keyboard Navigation

```javascript
const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    handleSubmit();
  } else if (e.key === "Escape") {
    handleClose();
  }
};
```

---

## 🔒 Frontend Security Best Practices

### Secure Token Storage

```javascript
// Store sensitive tokens in memory or sessionStorage (not localStorage)
const storeToken = (token) => {
  sessionStorage.setItem("auth_token", token);
};

const getToken = () => {
  return sessionStorage.getItem("auth_token");
};
```

### XSS Protection

```javascript
// Don't use innerHTML, use React's default escaping
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe
<div>{userInput}</div>
```

### CSRF Tokens

```javascript
// Include CSRF token in headers
const apiCall = async (url, options = {}) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  return fetch(url, {
    ...options,
    headers: {
      "X-CSRF-Token": token,
      ...options.headers,
    },
  });
};
```

---

## 📱 Progressive Web App (PWA)

### Service Worker Registration

```javascript
// src/service-worker-register.js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => console.log("SW registered"))
    .catch((err) => console.log("SW registration failed"));
}
```

### Manifest File

```json
{
  "name": "Ghor Bari",
  "short_name": "GB",
  "description": "Property rental platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066FF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```javascript
// src/__tests__/components/PropertyCard.test.jsx
import { render, screen } from "@testing-library/react";
import PropertyCard from "../../Components/PropertyCard";

describe("PropertyCard", () => {
  it("renders property title", () => {
    render(<PropertyCard property={{ title: "Test" }} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
// Test component with API calls
it("loads and displays properties", async () => {
  render(<Properties />);
  await waitFor(() => {
    expect(screen.getByText("Property Title")).toBeInTheDocument();
  });
});
```

---

## 🌍 Browser Compatibility

| Browser     | Support             | Notes                              |
| ----------- | ------------------- | ---------------------------------- |
| Chrome/Edge | Latest              | Full ES2020+ support               |
| Firefox     | Latest              | Full ES2020+ support               |
| Safari      | 14+                 | Some dynamic imports need polyfill |
| Mobile      | iOS 13+, Android 9+ | Touch-optimized                    |

---

## 📊 Bundle Size Analysis

```bash
# Check bundle size
npm run build

# Analyze bundles
npm install --save-dev webpack-bundle-analyzer

# Results show:
# - Main bundle: ~45KB gzipped
# - Vendor: ~120KB gzipped
# - Dynamic chunks: ~15-25KB each
```

---

## 🔗 Related Documentation

- See [main README](/../../README.md) for project overview
- See [Backend README](/../../backend/README.md) for API details
- See [Deployment Guide](/../../BACKEND_VERCEL_DEPLOYMENT_GUIDE.md) for hosting

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
