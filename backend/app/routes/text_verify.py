# app/routes/text_verify.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.utils.verifier import verify_claim_with_gemini
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/api",
    tags=["Text Verification"]
)

class TextInput(BaseModel):
    text: str

@router.post("/verify-text")
def verify_text(request: TextInput):
    """
    Endpoint to verify if a given text is true or misinformation.
    """
    result = verify_claim_with_gemini(request.text)
    return JSONResponse(content=result)
