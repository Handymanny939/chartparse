import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/app");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "3rem 2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center", maxWidth: "400px", width: "100%" }}>
        
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#2563eb", margin: "0 0 0.5rem" }}>⚕ ChartParse</h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 2rem" }}>Sign in to access the clinical note parser</p>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%", padding: "0.85rem", background: "white", border: "1px solid #e2e8f0",
            borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
            color: "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
          }}
        >
          <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
          Continue with Google
        </button>

        <p style={{ marginTop: "1.5rem", fontSize: "12px", color: "#94a3b8" }}>
          By signing in you agree to our terms of service
        </p>
      </div>
    </div>
  );
}