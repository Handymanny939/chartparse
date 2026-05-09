import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 2.5rem", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>⚕ ChartParse</span>
        <button onClick={() => navigate("/app")} style={{ padding: "0.5rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
          Try Demo
        </button>
      </nav>

      <section style={{ textAlign: "center", padding: "5rem 1.5rem 3rem" }}>
        <div style={{ display: "inline-block", background: "#eff6ff", color: "#2563eb", padding: "0.35rem 1rem", borderRadius: "99px", fontSize: "13px", fontWeight: "600", marginBottom: "1.5rem" }}>
          Built for solo medical practices
        </div>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: "800", color: "#0f172a", margin: "0 0 1.25rem", lineHeight: "1.15", letterSpacing: "-1.5px" }}>
          Turn clinical notes into
          <br />
          <span style={{ color: "#2563eb" }}>structured data instantly</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: "1.6" }}>
          Paste any SOAP note. ChartParse extracts patient info, vitals, diagnoses with ICD-10 codes, medications, and follow-up actions in seconds.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/app")} style={{ padding: "0.85rem 2.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
            Try it free
          </button>
          <button onClick={() => navigate("/app")} style={{ padding: "0.85rem 2.25rem", background: "white", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
            See demo
          </button>
        </div>
      </section>

      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "28px", marginBottom: "0.75rem" }}>⚡</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 0.5rem" }}>Parse in seconds</h3>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.6" }}>Drop in any clinical note and get clean structured data back instantly — no manual entry.</p>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "28px", marginBottom: "0.75rem" }}>🏷️</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 0.5rem" }}>ICD-10 codes included</h3>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.6" }}>Every diagnosis comes with the correct billing code automatically extracted.</p>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "28px", marginBottom: "0.75rem" }}>📥</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 0.5rem" }}>Export to CSV</h3>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.6" }}>Download parsed data as a CSV file ready to import into your EHR or billing system.</p>
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "1.5rem", borderTop: "1px solid #e2e8f0", color: "#94a3b8", fontSize: "13px" }}>
        2026 ChartParse — Built for solo practices
      </footer>

    </div>
  );
}