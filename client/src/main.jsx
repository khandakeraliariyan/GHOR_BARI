import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./Router";




createRoot(document.getElementById("root")).render(
  <StrictMode>
   
        <div className="max-w-[1440px]">
          <RouterProvider router={router} />
        </div>
        
      
  </StrictMode>
);
