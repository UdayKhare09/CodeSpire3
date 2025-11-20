# RAG FastAPI + React Demo (Gemini)

This repository provides a RAG (retrieval-augmented generation) system using a PDF as the knowledge source and Google's Gemini model for answering.

## Stack
- **RAG Backend**: FastAPI, SentenceTransformers, PyMuPDF, Google GenAI SDK (Port 8000).
- **Auth Backend**: Spring Boot, Spring Security, JWT, PostgreSQL (Port 8080).
- **Frontend**: React, Vite, Tailwind CSS v4, GSAP, Lenis (Port 5173).

## Quick Start

### 1. RAG Backend (Python)
```pwsh
# Terminal 1
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:GOOGLE_API_KEY = "AIza..."
# Optional: Set JWT_SECRET to match Spring Boot if changed from default
# $env:JWT_SECRET = "your-secret..."
uvicorn src.app:app --reload --port 8000
```

### 2. Auth Backend (Java/Spring Boot)
Ensure you have Java 21+ and Maven installed.
```pwsh
# Terminal 2
cd sec
./mvnw spring-boot:run
```
*Note: Requires PostgreSQL running on localhost:5432 (db: elrond, user: uday, pass: Uday@88717) or update `sec/src/main/resources/application.properties`.*

### 3. Frontend (React)
```pwsh
# Terminal 3
cd frontend
npm install
npm run dev
```

4. **Open App**
   Visit `http://localhost:5173`. You will be redirected to login. Register a new account to access the RAG interface.

## Notes
- The RAG backend downloads `human-nutrition-text.pdf` automatically.
- Embeddings are cached in `src/embeddings.npz`.

