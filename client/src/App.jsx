import { useState } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
const SAMPLE_NOTES = {
  "Acute Bronchitis": `Patient: John Smith, DOB: 03/15/1970. Visit Date: 05/01/2026. Chief Complaint: Persistent cough and shortness of breath for 5 days. Vitals: BP 138/88, HR 92, Temp 99.8F, Weight 185lbs. Assessment: 1. Acute bronchitis 2. Mild hypertension. Plan: Prescribed Azithromycin 500mg for 5 days, Albuterol inhaler as needed. Follow up in 2 weeks if symptoms persist.`,

  "Type 2 Diabetes": `Patient: Maria Garcia, DOB: 07/22/1965. Visit Date: 05/01/2026. Chief Complaint: Routine diabetes follow-up, fatigue and increased thirst. Vitals: BP 142/90, HR 78, Temp 98.4F, Weight 210lbs. Assessment: 1. Type 2 diabetes mellitus, uncontrolled 2. Hypertension. Plan: Increase Metformin to 1000mg twice daily, continue Lisinopril 10mg, recheck HbA1c in 3 months. Follow up in 6 weeks.`,

  "Chest Pain": `Patient: Robert Johnson, DOB: 11/03/1958. Visit Date: 05/01/2026. Chief Complaint: Intermittent chest pain and shortness of breath for 2 days. Vitals: BP 155/95, HR 88, Temp 98.6F, Weight 220lbs. Assessment: 1. Unstable angina 2. Hyperlipidemia. Plan: Prescribed Nitroglycerin 0.4mg sublingual PRN, Atorvastatin 40mg daily. EKG ordered, cardiology referral placed. Follow up in 48 hours or sooner if symptoms worsen.`,

  "Upper Respiratory": `Patient: Emily Chen, DOB: 04/18/1990. Visit Date: 05/01/2026. Chief Complaint: Sore throat, runny nose, mild fever for 3 days. Vitals: BP 118/76, HR 82, Temp 100.2F, Weight 135lbs. Assessment: 1. Acute upper respiratory infection 2. Pharyngitis. Plan: Rest, fluids, Ibuprofen 400mg every 6 hours as needed for fever and pain. No antibiotics indicated at this time. Follow up if symptoms worsen or persist beyond 7 days.`,

  "Back Pain": `Patient: Michael Torres, DOB: 09/30/1982. Visit Date: 05/01/2026. Chief Complaint: Lower back pain radiating to left leg after lifting at work 4 days ago. Vitals: BP 124/80, HR 74, Temp 98.4F, Weight 195lbs. Assessment: 1. Lumbar radiculopathy 2. Muscle strain. Plan: Prescribed Cyclobenzaprine 5mg at bedtime, Naproxen 500mg twice daily. Physical therapy referral placed. Follow up in 2 weeks.`
};
const styles = {
  app: { minHeight: "100vh", background: "#f8fafc" },
  header: {
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    padding: "0.75rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flexWrap: "wrap"
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" },
  card: { background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  cardFull: { background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", gridColumn: "1 / -1" },
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
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState([]);

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
      const parsed = JSON.parse(data.result);
      setResult(parsed);
      if (user) {
        await addDoc(collection(db, "parses"), {
          uid: user.uid,
          result: parsed,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      setError("Could not parse the note. Make sure the server is running at localhost:8000.");
    }
    setLoading(false);
  };

  const handleSignOut = () => signOut(auth);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "parses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Field", "Value"],
      ["Patient Name", result.patient_name],
      ["Date of Visit", result.date_of_visit],
      ["Chief Complaint", result.chief_complaint],
      ["Blood Pressure", result.vitals?.blood_pressure],
      ["Heart Rate", result.vitals?.heart_rate],
      ["Temperature", result.vitals?.temperature],
      ["Weight", result.vitals?.weight],
      ...result.diagnoses?.map((d) => [
        "Diagnosis",
        typeof d === "object" ? `${d.name} (${d.icd10})` : d
      ]),
      ...result.medications?.map((m) => ["Medication", m]),
      ...result.cpt_codes?.map((c) => ["CPT Code", `${c.code} — ${c.description}`]) ?? [],
      ["Follow Up", result.follow_up],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.patient_name?.replace(/\s+/g, "_") ?? "chart"}_parsed.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:8000/parse-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const parsed = JSON.parse(data.result);
      setResult(parsed);
      if (user) {
        await addDoc(collection(db, "parses"), {
          uid: user.uid,
          result: parsed,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      setError("Could not parse the PDF. Make sure the server is running.");
    }
    setLoading(false);
  };

  const handleSampleLoad = (e) => {
    const selected = e.target.value;
    if (selected) {
      setNote(SAMPLE_NOTES[selected]);
      setResult(null);
      setError(null);
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>⚕ ChartParse</h1>
        </div>
        <p style={styles.tagline}>AI-powered clinical note parser for solo practices</p>
        {user && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user.photoURL && <img src={user.photoURL} alt="avatar" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />}
            <span style={{ fontSize: "14px", color: "#374151" }}>{user.displayName}</span>
            <button onClick={handleSignOut} style={{ padding: "0.4rem 1rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", cursor: "pointer", color: "#64748b" }}>
              Sign out
            </button>
          </div>
        )}
      </header>

      <main style={styles.main}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <label style={{ ...styles.label, marginBottom: 0 }}>Paste Clinical Note</label>
          <select
            onChange={handleSampleLoad}
            defaultValue=""
            style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#374151", background: "white", cursor: "pointer" }}
          >
            <option value="" disabled>Load sample note...</option>
            {Object.keys(SAMPLE_NOTES).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
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
          <label style={{ ...styles.clearBtn, cursor: "pointer", display: "inline-block" }}>
            📄 Upload PDF
            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handlePDFUpload}
              disabled={loading}
            />
          </label>
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
               <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={handleCopy} style={styles.copyBtn}>
                  {copied ? "✓ Copied!" : "Copy JSON"}
                </button>
                <button onClick={handleDownloadCSV} style={{ ...styles.copyBtn, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                  ↓ Download CSV
                </button>
              </div>
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

              {result.cpt_codes?.length > 0 && (
                <Card title="CPT Codes" color="#dc2626" full>
                  {result.cpt_codes?.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{ ...styles.tag, background: "#fef2f2", color: "#991b1b", fontFamily: "monospace", fontSize: "13px", fontWeight: "700" }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: "14px", color: "#374151" }}>{c.description}</span>
                    </div>
                  ))}
                </Card>
              )}

              <Card title="Follow Up" color="#0891b2" full>
                <p style={{ fontSize: "14px", color: "#374151" }}>{result.follow_up}</p>
              </Card>
            </div>
          </>
        )}
      </main>

      {history.length > 0 && (
        <aside style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "0.75rem" }}>Recent Parses</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {history.slice(0, 10).map((h) => (
              <div
                key={h.id}
                onClick={() => setResult(h.result)}
                style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.75rem 1rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>{h.result?.patient_name ?? "Unknown"}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{h.result?.date_of_visit ?? ""}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}