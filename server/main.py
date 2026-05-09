from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
import anthropic
import pymupdf
import logging
import os
import json

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── App setup ─────────────────────────────────────────────────────────────────
load_dotenv()

app = FastAPI(title="ChartParse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Anthropic client ──────────────────────────────────────────────────────────
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise RuntimeError("ANTHROPIC_API_KEY is not set in environment variables")

client = anthropic.Anthropic(api_key=api_key)

# ── Request models ────────────────────────────────────────────────────────────
class NoteRequest(BaseModel):
    note: str

    @field_validator("note")
    @classmethod
    def note_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Clinical note cannot be empty")
        if len(v.strip()) < 20:
            raise ValueError("Clinical note is too short to parse")
        return v.strip()

# ── Claude prompt ─────────────────────────────────────────────────────────────
PROMPT_TEMPLATE = """You are a medical data extraction assistant.
Extract the following from this clinical note and return ONLY valid JSON, no explanation, no markdown, no code fences:
- patient_name
- date_of_visit
- chief_complaint
- vitals (blood_pressure, heart_rate, temperature, weight)
- diagnoses: a list of objects, each with "name" and "icd10" fields (e.g. {{"name": "Acute bronchitis", "icd10": "J20.9"}})
- cpt_codes: a list of objects, each with "code" and "description" fields representing the most likely procedure codes billed for this visit (e.g. {{"code": "99213", "description": "Office visit, established patient, moderate complexity"}})
- medications (list)
- follow_up

Clinical note:
{note}"""

# ── Shared parsing logic ──────────────────────────────────────────────────────
async def parse_with_claude(note_text: str) -> str:
    logger.info("Sending note to Claude — length: %d chars", len(note_text))
    try:
        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": PROMPT_TEMPLATE.format(note=note_text),
                }
            ],
        )
        raw = message.content[0].text
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        # Validate it's actually JSON before returning
        json.loads(cleaned)
        logger.info("Claude returned valid JSON successfully")
        return cleaned

    except json.JSONDecodeError as e:
        logger.error("Claude returned invalid JSON: %s", e)
        raise HTTPException(status_code=502, detail="AI returned malformed response. Please try again.")
    except anthropic.APIError as e:
        logger.error("Anthropic API error: %s", e)
        raise HTTPException(status_code=502, detail="AI service error. Please try again.")

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "ChartParse API is running", "version": "1.0.0"}

@app.post("/parse")
async def parse_note(request: NoteRequest):
    logger.info("POST /parse — note length: %d", len(request.note))
    result = await parse_with_claude(request.note)
    return {"result": result}

@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    logger.info("POST /parse-pdf — filename: %s", file.filename)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB")

    try:
        doc = pymupdf.open(stream=contents, filetype="pdf")
        text = "".join(page.get_text() for page in doc)
        doc.close()
    except Exception as e:
        logger.error("PDF extraction failed: %s", e)
        raise HTTPException(status_code=422, detail="Could not extract text from PDF")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No text found in PDF. It may be a scanned image.")

    logger.info("Extracted %d chars from PDF", len(text))
    result = await parse_with_claude(text)
    return {"result": result}