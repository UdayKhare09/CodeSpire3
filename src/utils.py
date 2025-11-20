import os
import json
import math
import requests
from typing import Tuple

import numpy as np
import fitz
from google import genai
from sentence_transformers import SentenceTransformer, util

# Config - modify as needed or via environment variables
PDF_URL = "https://pressbooks.oer.hawaii.edu/humannutrition2/open/download?type=pdf"
PDF_PATH = os.path.join(os.path.dirname(__file__), "human-nutrition-text.pdf")
EMBED_CACHE = os.path.join(os.path.dirname(__file__), "embeddings.npz")
CHUNKS_CACHE = os.path.join(os.path.dirname(__file__), "chunks.json")

# Runtime globals (populated at startup)
embedding_model: SentenceTransformer = None
embeddings: np.ndarray = None
pages_and_chunks: list = []


def download_pdf_if_missing(pdf_path: str = PDF_PATH):
    if os.path.exists(pdf_path):
        return pdf_path
    resp = requests.get(PDF_URL, timeout=30)
    resp.raise_for_status()
    with open(pdf_path, "wb") as f:
        f.write(resp.content)
    return pdf_path


def split_text_to_sentences(text: str):
    # Lightweight sentence splitter fallback
    text = text.replace("\n", " ")
    candidates = [s.strip() for s in text.split('.') if s.strip()]
    return [c + '.' for c in candidates]


def build_chunks_from_pdf(pdf_path: str = PDF_PATH, chunk_size_sentences: int = 10):
    doc = fitz.open(pdf_path)
    chunks = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        sentences = split_text_to_sentences(text)
        for i in range(0, len(sentences), chunk_size_sentences):
            chunk_sents = sentences[i:i + chunk_size_sentences]
            joined = " ".join(chunk_sents).strip()
            if len(joined) > 50:
                chunks.append({
                    "page_number": page_num,
                    "sentence_chunk": joined,
                    "chunk_char_count": len(joined),
                })
    return chunks


def create_embeddings(text_chunks: list):
    global embedding_model, embeddings
    if embedding_model is None:
        embedding_model = SentenceTransformer("all-mpnet-base-v2")
    texts = [c["sentence_chunk"] for c in text_chunks]
    emb = embedding_model.encode(texts, batch_size=32, convert_to_numpy=True)
    embeddings = emb
    return emb


def prepare_resources():
    global pages_and_chunks, embeddings, embedding_model
    # Ensure PDF
    pdf_path = download_pdf_if_missing()

    # Try loading cached chunks/embeddings
    if os.path.exists(CHUNKS_CACHE) and os.path.exists(EMBED_CACHE):
        with open(CHUNKS_CACHE, 'r', encoding='utf-8') as f:
            pages_and_chunks = json.load(f)
        data = np.load(EMBED_CACHE)
        embeddings = data['arr_0']
        embedding_model = SentenceTransformer("all-mpnet-base-v2")
        return

    # Otherwise build
    pages_and_chunks = build_chunks_from_pdf(pdf_path)
    emb = create_embeddings(pages_and_chunks)

    # Cache
    with open(CHUNKS_CACHE, 'w', encoding='utf-8') as f:
        json.dump(pages_and_chunks, f, ensure_ascii=False)
    np.savez_compressed(EMBED_CACHE, emb)


def retrieve_relevant_resources(query: str, top_k: int = 5) -> Tuple[np.ndarray, list]:
    global embeddings, embedding_model, pages_and_chunks
    if embeddings is None or embedding_model is None:
        raise RuntimeError("Embeddings or model not initialized. Call prepare_resources() first.")
    q_emb = embedding_model.encode([query], convert_to_numpy=True)[0]
    # Cosine similarity
    emb_norm = embeddings / (np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-12)
    q_norm = q_emb / (np.linalg.norm(q_emb) + 1e-12)
    sims = emb_norm.dot(q_norm)
    if top_k > len(sims):
        top_k = len(sims)
    idx = np.argsort(-sims)[:top_k]
    return sims[idx], idx.tolist()


def call_gemmini_summarize(prompt: str) -> str:
    """
    Calls the Google GenAI API (Gemini) for summarization.
    Requires GOOGLE_API_KEY environment variable.
    Uses the new `google-genai` SDK.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set. Please set it to your Google AI API key.")

    client = genai.Client(api_key=api_key)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"
