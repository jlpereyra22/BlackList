import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/Index.css";

import { AuthProvider } from "./auth/AuthProvider.jsx";
import RootApp from "./RootApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  </StrictMode>
);
