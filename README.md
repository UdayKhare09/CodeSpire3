# RAG FastAPI + React Demo (Gemini)

This repository provides a RAG (retrieval-augmented generation) system using a PDF as the knowledge source and Google's Gemini model for answering.

## Stack
- **Backend**: FastAPI, SentenceTransformers, PyMuPDF, Google GenAI SDK.
- **Frontend**: React, Vite, Tailwind CSS v4, GSAP, Lenis.

## Quick Start

1. **Backend Setup**
   ```pwsh
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. **Configure API Key**
   ```pwsh
   $env:GOOGLE_API_KEY = "AIza..."
   ```

3. **Run Backend**
   ```pwsh
   uvicorn src.app:app --reload --port 8000
   ```

4. **Frontend Setup & Run**
   Open a new terminal:
   ```pwsh
   cd frontend
   npm install
   npm run dev
   ```

5. **Open App**
   Visit `http://localhost:5173`

## Notes
- The backend will automatically download `human-nutrition-text.pdf` if missing.
- Embeddings are cached in `src/embeddings.npz`.
