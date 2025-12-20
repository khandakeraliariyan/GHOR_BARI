import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./Firebase/AuthProvider";
import router from "./Router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <div className="max-w-[1440px]">
        <RouterProvider router={router} />
      </div>
      <Toaster position="top-right" />
    </AuthProvider>
  </React.StrictMode>
);
