import { useState } from "react";

function App() {
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError("Failed to parse note. Make sure the server is running.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2563eb" }}>ChartParse</h1>
      <p style={{ color: "#6b7280" }}>AI-powered clinical note parser for solo practices</p>

      <textarea
        rows={10}
        style={{ width: "100%", padding: "1rem", fontSize: "14px", borderRadius: "8px", border: "1px solid #d1d5db" }}
        placeholder="Paste your clinical note here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        onClick={handleParse}
        disabled={loading || !note}
        style={{ marginTop: "1rem", padding: "0.75rem 2rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
      >
        {loading ? "Parsing..." : "Parse Note"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Extracted Data</h2>

          <div style={{ background: "#f0f9ff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <h3>Patient Info</h3>
            <p><strong>Name:</strong> {result.patient_name}</p>
            <p><strong>Date of Visit:</strong> {result.date_of_visit}</p>
            <p><strong>Chief Complaint:</strong> {result.chief_complaint}</p>
          </div>

          <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <h3>Vitals</h3>
            <p><strong>Blood Pressure:</strong> {result.vitals?.blood_pressure}</p>
            <p><strong>Heart Rate:</strong> {result.vitals?.heart_rate}</p>
            <p><strong>Temperature:</strong> {result.vitals?.temperature}</p>
            <p><strong>Weight:</strong> {result.vitals?.weight}</p>
          </div>

          <div style={{ background: "#fefce8", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <h3>Diagnoses</h3>
            <ul>{result.diagnoses?.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>

          <div style={{ background: "#fdf4ff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <h3>Medications</h3>
            <ul>{result.medications?.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>

          <div style={{ background: "#fff7ed", padding: "1rem", borderRadius: "8px" }}>
            <h3>Follow Up</h3>
            <p>{result.follow_up}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;