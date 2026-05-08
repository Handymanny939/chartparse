import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Landing from "./Landing";
import Login from "./Login";
import App from "./App";
import "./index.css";

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<ProtectedRoute><App /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);