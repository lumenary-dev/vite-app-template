import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import DebugSdk from "./pages/DebugSdk.tsx";
import Demo from "@/app/demo/Demo.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/debug-sdk" element={<DebugSdk />} />
        <Route path="/internal" element={<Demo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
