import { useState } from "react";

const styles = {
  app: { minHeight: "100vh", background: "#f8fafc" },
  header: {
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
  },
  logo: { fontSize: "22px", fontWeight: "700", color: "#2563eb", margin: 0 },
  tagline: { fontSize: "13px", color: "#94a3b8", margin: 0 },
  main: { maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  label: { display: "block", fontWeight: "600", marginBottom: "0.5rem", color: "#374151", fontSize: "14px" },
  textarea: {
    width: "100%", padding: "1rem", fontSize: "14px", lineHeight: "1.6",
    borderRadius: "10px", border: "1px solid #e2e8f0", background: "white",
    resize: "vertical", outline: "none", fontFamily: "inherit",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)", transition: "border 0.2s"
  },
  buttonRow: { display: "flex", gap: "0.75rem", marginTop: "1rem", alignItems: "center" },
  parseBtn: {
    padding: "0.7rem 2rem", background: "#2563eb", color: "white",
    border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600",
    cursor: "pointer", transition: "background 0.2s"
  },
  parseBtnDisabled: {
    padding: "0.7rem 2rem", background: "#93c5fd", color: "white",
    border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600",
    cursor: "not-allowed"
  },
  clearBtn: {
    padding: "0.7rem 1.25rem", background: "white", color: "#64748b",
    border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px",
    cursor: "pointer"
  },
  error: {
    marginTop: "1rem", padding: "0.85rem 1rem", background: "#fef2f2",
    border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "14px"
  },
  resultsHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", margin: "2rem 0 1rem"
  },
  resultsTitle: { fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0 },
  copyBtn: {
    padding: "0.5rem 1rem", background: "white", border: "1px solid #e2e8f0",
    borderRadius: "6px", fontSize: "13px", cursor: "pointer", color: "#64748b",
    fontWeight: "500"
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  card: { background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  cardFull: { background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", gridColumn: "span 2" },
  cardTitle: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.85rem" },
  field: { marginBottom: "0.5rem", fontSize: "14px", color: "#374151" },
  fieldLabel: { fontWeight: "600", color: "#64748b", fontSize: "13px" },
  tag: {
    display: "inline-block", padding: "0.25rem 0.65rem",
    borderRadius: "99px", fontSize: "13px", fontWeight: "500", margin: "0.2rem"
  },
};

function Card({ title, color, children, full }) {
  return (
    <div style={{ ...(full ? styles.cardFull : styles.card), borderTop: `3px solid ${color}` }}>
      <div style={{ ...styles.cardTitle, color }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}: </span>
      {value}
    </div>
  );
}

export default function App() {
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await response.json();
      setResult(JSON.parse(data.result));
    } catch (err) {
      setError("Could not parse the note. Make sure the server is running at localhost:8000.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>⚕ ChartParse</h1>
        </div>
        <p style={styles.tagline}>AI-powered clinical note parser for solo practices</p>
      </header>

      <main style={styles.main}>
        <label style={styles.label}>Paste Clinical Note</label>
        <textarea
          rows={10}
          style={styles.textarea}
          placeholder="Paste a SOAP note or any clinical note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div style={styles.buttonRow}>
          <button
            onClick={handleParse}
            disabled={loading || !note}
            style={loading || !note ? styles.parseBtnDisabled : styles.parseBtn}
          >
            {loading ? "⏳ Parsing..." : "Parse Note"}
          </button>
          {note && (
            <button onClick={() => { setNote(""); setResult(null); setError(null); }} style={styles.clearBtn}>
              Clear
            </button>
          )}
        </div>

        {error && <div style={styles.error}>⚠ {error}</div>}

        {result && (
          <>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>Extracted Data</h2>
              <button onClick={handleCopy} style={styles.copyBtn}>
                {copied ? "✓ Copied!" : "Copy JSON"}
              </button>
            </div>

            <div style={styles.grid}>
              <Card title="Patient Info" color="#2563eb">
                <Field label="Name" value={result.patient_name} />
                <Field label="Date of Visit" value={result.date_of_visit} />
                <Field label="Chief Complaint" value={result.chief_complaint} />
              </Card>

              <Card title="Vitals" color="#16a34a">
                <Field label="Blood Pressure" value={result.vitals?.blood_pressure} />
                <Field label="Heart Rate" value={result.vitals?.heart_rate} />
                <Field label="Temperature" value={result.vitals?.temperature} />
                <Field label="Weight" value={result.vitals?.weight} />
              </Card>

              <Card title="Diagnoses" color="#d97706">
                {result.diagnoses?.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{ ...styles.tag, background: "#fef3c7", color: "#92400e" }}>
                      {typeof d === "object" ? d.name : d}
                    </span>
                    {typeof d === "object" && d.icd10 && (
                      <span style={{ ...styles.tag, background: "#f0f9ff", color: "#1e40af", fontFamily: "monospace", fontSize: "12px" }}>
                        {d.icd10}
                      </span>
                    )}
                  </div>
                ))}
              </Card>

              <Card title="Medications" color="#7c3aed">
                {result.medications?.map((m, i) => (
                  <span key={i} style={{ ...styles.tag, background: "#f3e8ff", color: "#6b21a8" }}>{m}</span>
                ))}
              </Card>

              <Card title="Follow Up" color="#0891b2" full>
                <p style={{ fontSize: "14px", color: "#374151" }}>{result.follow_up}</p>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}