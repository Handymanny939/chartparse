import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
from main import app

# ── Test client setup ─────────────────────────────────────────────────────────
@pytest.fixture
def anyio_backend():
    return "asyncio"

async def get_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")

# ── Health check ──────────────────────────────────────────────────────────────
@pytest.mark.anyio
async def test_root_returns_200():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "ChartParse API is running"

# ── Input validation ──────────────────────────────────────────────────────────
@pytest.mark.anyio
async def test_empty_note_returns_422():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/parse", json={"note": ""})
    assert response.status_code == 422

@pytest.mark.anyio
async def test_short_note_returns_422():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/parse", json={"note": "too short"})
    assert response.status_code == 422

# ── PDF validation ────────────────────────────────────────────────────────────
@pytest.mark.anyio
async def test_non_pdf_file_returns_400():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/parse-pdf",
            files={"file": ("note.txt", b"some text content", "text/plain")}
        )
    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]

@pytest.mark.anyio
async def test_empty_pdf_returns_400():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/parse-pdf",
            files={"file": ("note.pdf", b"", "application/pdf")}
        )
    assert response.status_code == 400

# ── Successful parse (mocked Claude) ─────────────────────────────────────────
@pytest.mark.anyio
async def test_parse_returns_structured_json():
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text='{"patient_name": "John Smith", "date_of_visit": "05/01/2026", "chief_complaint": "cough", "vitals": {}, "diagnoses": [], "cpt_codes": [], "medications": [], "follow_up": "2 weeks"}')]

    with patch("main.client.messages.create", return_value=mock_response):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/parse", json={
                "note": "Patient: John Smith. Visit Date: 05/01/2026. Chief Complaint: Persistent cough for 5 days. Vitals: BP 138/88."
            })

    assert response.status_code == 200
    assert "result" in response.json()
    import json
    result = json.loads(response.json()["result"])
    assert result["patient_name"] == "John Smith"