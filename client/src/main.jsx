import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./Firebase/AuthProvider";
import { ComparisonProvider } from "./context/ComparisonContext";
import router from "./Router";
import "./index.css";
import "leaflet/dist/leaflet.css";


// Create TanStack Query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ComparisonProvider>
          <div className="max-w-[1440px]">
            <RouterProvider router={router} />
          </div>
          <Toaster position="top-right" />
        </ComparisonProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
