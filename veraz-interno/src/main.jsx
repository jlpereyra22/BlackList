// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 👇 Import correcto (carpeta 'style' y 'Index.css' con I mayúscula)
import "./style/Index.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
