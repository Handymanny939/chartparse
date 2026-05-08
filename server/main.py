from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic
import pymupdf
import os

load_dotenv()

app = FastAPI(title="ChartParse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class NoteRequest(BaseModel):
    note: str

def parse_with_claude(note_text: str):
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"""You are a medical data extraction assistant. 
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
{note_text}"""
            }
        ]
    )
    raw = message.content[0].text
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    return cleaned.strip()

@app.get("/")
def root():
    return {"message": "ChartParse API is running"}

@app.post("/parse")
def parse_note(request: NoteRequest):
    result = parse_with_claude(request.note)
    return {"result": result}

@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    doc = pymupdf.open(stream=contents, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    result = parse_with_claude(text)
    return {"result": result}