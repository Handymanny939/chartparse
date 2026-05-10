# ChartParse

AI-powered clinical note parser for solo medical practices. Paste or upload a SOAP note and get back structured patient data, ICD-10 diagnosis codes, CPT billing codes, and medications — in seconds.

**Live demo:** [chartparse.vercel.app](https://chartparse.vercel.app)  
**API:** [chartparse-production.up.railway.app](https://chartparse-production.up.railway.app)

---

## What it does

Solo medical practices spend hours manually transcribing clinical notes into billing systems. ChartParse uses Claude AI to extract structured data from unstructured clinical notes instantly.

**Input:** Any SOAP note (pasted text or PDF upload)  
**Output:** Structured JSON with patient info, vitals, diagnoses + ICD-10 codes, CPT codes, medications, and follow-up actions

---

## Features

- **AI parsing** — Extracts structured data from any clinical note format
- **ICD-10 codes** — Automatic diagnosis billing codes per visit
- **CPT codes** — Procedure billing codes extracted per encounter
- **PDF upload** — Upload scanned clinical note PDFs directly
- **CSV export** — Download parsed data for EHR/billing import
- **Note history** — Every parse saved per user via Firestore
- **Google auth** — One-click sign in, protected routes
- **Mobile responsive** — Works on phones and tablets

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Python 3.12, FastAPI, Uvicorn |
| AI | Anthropic Claude API (`claude-sonnet-4-5`) |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Cloud Firestore |
| PDF parsing | PyMuPDF |

---

## Backend highlights

The Python/FastAPI backend is built to production standards:

- **Async endpoints** — All routes use `async/await` for non-blocking I/O
- **Input validation** — Pydantic v2 validators reject empty or malformed input
- **Error handling** — Proper HTTP status codes (400, 413, 422, 502) with descriptive messages
- **Structured logging** — Timestamped logs for every request and Claude API call
- **JSON validation** — Claude responses validated before returning to client
- **File security** — PDF uploads validated for type, size (10MB limit), and content
- **Unit tested** — 6 pytest tests covering validation, file handling, and mocked AI responses

---

## Project structure

```
chartparse/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx          # Main parser UI
│   │   ├── Landing.jsx      # Marketing landing page
│   │   ├── Login.jsx        # Google auth login
│   │   ├── firebase.js      # Firebase config
│   │   └── main.jsx         # Router + protected routes
│   └── package.json
├── server/                  # Python + FastAPI backend
│   ├── main.py              # API endpoints + Claude integration
│   ├── test_main.py         # Unit tests (pytest)
│   └── requirements.txt
└── README.md
```

---

## Local setup

**Prerequisites:** Node.js 18+, Python 3.12+, Anthropic API key, Firebase project

**Backend:**
```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
# Add ANTHROPIC_API_KEY to .env
uvicorn main:app --reload
```

**Frontend:**
```bash
cd client
npm install
# Add Firebase keys to client/.env
npm run dev
```

**Run tests:**
```bash
cd server
venv\Scripts\activate
pytest test_main.py -v
```

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/parse` | Parse clinical note text |
| `POST` | `/parse-pdf` | Parse uploaded PDF file |

**POST /parse — Request:**
```json
{
  "note": "Patient: John Smith. Visit Date: 05/01/2026..."
}
```

**POST /parse — Response:**
```json
{
  "result": {
    "patient_name": "John Smith",
    "date_of_visit": "05/01/2026",
    "chief_complaint": "Persistent cough",
    "vitals": { "blood_pressure": "138/88", "heart_rate": "92" },
    "diagnoses": [{ "name": "Acute bronchitis", "icd10": "J20.9" }],
    "cpt_codes": [{ "code": "99213", "description": "Office visit, moderate complexity" }],
    "medications": ["Azithromycin 500mg for 5 days"],
    "follow_up": "2 weeks if symptoms persist"
  }
}
```

---

## Environment variables

**Root `.env` (backend):**
```
ANTHROPIC_API_KEY=your-key-here
```

**`client/.env` (frontend):**
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

---

Built by Manuel Garcia
