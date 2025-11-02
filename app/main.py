# app/main.py
from fastapi import FastAPI
from app.routes import text_verify
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Misinformation Detection Suite",
    description="API backend for detecting misinformation in text using Gemini 2.0 Flash-Lite.",
    version="1.0.0"
)

# ✅ Allow frontend requests (CORS fix)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during dev, allow all. later, restrict to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(text_verify.router)

@app.get("/")
def root():
    return {"message": "Misinformation Detection API is running 🚀"}
