import os
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src import utils


class AskRequest(BaseModel):
    query: str
    top_k: int = 5


app = FastAPI(title="RAG API (Gemmini)")

# Allow frontend served from same host during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_load_resources():
    # Downloads PDF (if missing), builds or loads cached chunks + embeddings
    utils.prepare_resources()


@app.post("/api/ask")
def ask(req: AskRequest):
    if not req.query or req.query.strip() == "":
        raise HTTPException(status_code=400, detail="Query is required")

    # Retrieve top-k context chunks
    scores, indices = utils.retrieve_relevant_resources(req.query, top_k=req.top_k)
    context_items = [utils.pages_and_chunks[i] for i in indices]

    # Build prompt for summarization/answering
    context_text = "\n\n".join([f"(page {c['page_number']}) {c['sentence_chunk']}" for c in context_items])
    prompt = f"Based on the following context, answer the query concisely.\n\nContext:\n{context_text}\n\nQuery: {req.query}\n\nAnswer:"

    # Call gemmini API (configured via env vars)
    try:
        answer = utils.call_gemmini_summarize(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "query": req.query,
        "answer": answer,
        "contexts": context_items,
        "scores": [float(s) for s in scores],
    }


# Endpoint to list/search matched chunks (useful for debugging)
@app.get("/api/search")
def search(q: str, top_k: int = 10):
    scores, indices = utils.retrieve_relevant_resources(q, top_k=top_k)
    items = [utils.pages_and_chunks[i] for i in indices]
    return {"query": q, "results": items, "scores": [float(s) for s in scores]}

