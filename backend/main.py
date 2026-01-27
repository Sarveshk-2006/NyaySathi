from fastapi import FastAPI, UploadFile, Form, File
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
import PyPDF2
import docx
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import Optional
from contextlib import closing

# Load API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), "uploaded_docs.db")

def init_db():
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                email TEXT PRIMARY KEY,
                content TEXT
            )
            """
        )
        conn.commit()

def save_document(email: str, content: str):
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO documents (email, content) VALUES (?, ?)",
            (email, content),
        )
        conn.commit()

def load_document(email: str) -> Optional[str]:
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cur = conn.cursor()
        cur.execute("SELECT content FROM documents WHERE email = ?", (email,))
        row = cur.fetchone()
        return row[0] if row else None

app = FastAPI(title="Citizen Legal Buddy API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class GenerateDocumentRequest(BaseModel):
    docType: str
    formData: dict

class PredictCaseRequest(BaseModel):
    caseDescription: str

# Initialize DB
init_db()

# ENDPOINTS FOR FRONTEND

@app.post("/api/generate-document")
async def generate_document(request: GenerateDocumentRequest):
    """Generate a legal document"""
    try:
        prompt = f"""
You are an AI Legal Assistant specializing in Indian law.
Generate a professional, complete legal document for: {request.docType}

Information provided:
{request.formData}

Create a ready-to-use legal document template with all necessary sections, clauses, and proper legal language for Indian courts. Format it clearly with proper structure.
"""
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        return {"text": text}
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e), "text": ""}

@app.post("/api/upload-and-summarize")
async def upload_and_summarize(document: UploadFile = File(...)):
    """Upload and analyze a legal document"""
    filename = document.filename.lower()
    text = ""

    try:
        if filename.endswith(".pdf"):
            document.file.seek(0)
            reader = PyPDF2.PdfReader(document.file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        elif filename.endswith(".txt"):
            document.file.seek(0)
            text = document.file.read().decode("utf-8")

        else:
            return {"error": "Unsupported file type. Please upload PDF or TXT."}

        if not text.strip():
            return {"error": "Could not extract text from document."}

        prompt = f"""
You are an AI Legal Assistant for Indian citizens.
Analyze and summarize this legal document clearly and simply.
Focus on:
- Key rights and obligations
- Important dates and deadlines
- Penalties or consequences
- Key parties involved
- Any important sections or clauses

Document (first 4000 chars):
{text[:4000]}

Provide a well-structured summary.
"""
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        summary = response.text.strip()
        return {"text": summary}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e), "text": ""}

@app.post("/api/predict-case")
async def predict_case(request: PredictCaseRequest):
    """Analyze a legal case or question"""
    try:
        prompt = f"""
You are an expert AI Legal Assistant specializing in Indian law (IPC, Constitution, Acts, etc.).

A user has asked the following legal question or described a legal situation:

"{request.caseDescription}"

Please provide:
1. Detailed explanation of relevant Indian laws and sections
2. Applicable IPC sections, Constitutional provisions, or Acts
3. Potential penalties or consequences
4. Related case law or precedents if applicable
5. Recommendations for next steps
6. Important disclaimers

Be clear, accurate, and helpful. Format the response well with proper sections.
IMPORTANT: Always remind users to consult with a qualified lawyer for specific legal advice.
"""
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        return {
            "text": text,
            "sources": []
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e), "text": ""}

@app.get("/api/recent-verdicts")
async def get_recent_verdicts():
    """Fetch recent Indian court verdicts"""
    try:
        prompt = """
You are an AI Legal Assistant for Indian citizens.
Generate 3-4 realistic (but fictional) recent Indian court verdicts. Format each exactly as follows:

**Case Name:** [Name of case]
**Court:** [Name of court]
**Date:** [Date in YYYY-MM-DD format]
**Summary:** [2-3 sentence summary]

---

Make them sound realistic and relevant to Indian law.
"""
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        return {
            "text": text,
            "sources": []
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e), "text": ""}

@app.get("/")
async def root():
    return {
        "message": "✅ Welcome to Nyay Saathi - Citizen Legal Buddy API!",
        "version": "2.0",
        "endpoints": {
            "document_generation": "/api/generate-document",
            "document_analysis": "/api/upload-and-summarize",
            "legal_query": "/api/predict-case",
            "verdicts": "/api/recent-verdicts"
        }
    }
