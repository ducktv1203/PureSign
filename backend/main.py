from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime

from services.supabase_client import get_supabase_client
from services.inference_pipeline import InferencePipeline
from services.storage_service import StorageService

load_dotenv()

app = FastAPI(title="PureSign API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
inference_pipeline = InferencePipeline()
storage_service = StorageService()


class VerifyRequest(BaseModel):
    user_id: str
    local_processing: bool = False


class VerificationResponse(BaseModel):
    verification_id: str
    detected_sig_url: Optional[str] = None
    cleaned_sig_url: Optional[str] = None
    confidence_score: float
    status: str
    timestamp: str


@app.get("/")
async def root():
    return {"message": "PureSign API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/verify", response_model=VerificationResponse)
async def verify_signature(
    file: UploadFile = File(...),
    user_id: str = None,
    local_processing: bool = False
):
    """
    Main verification endpoint that:
    1. Detects signature using YOLOv11
    2. Cleans signature using CycleGAN
    3. Verifies against reference using Siamese Network
    """
    try:
        # Validate user_id
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        # Get Supabase client
        supabase = get_supabase_client()

        # Get user profile and reference signature
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found")

        profile = profile_response.data[0]
        reference_sig_url = profile["reference_sig_url"]

        # Create verification record
        verification_id = str(uuid.uuid4())
        verification_data = {
            "id": verification_id,
            "user_id": user_id,
            "status": "processing",
            "timestamp": datetime.utcnow().isoformat()
        }

        # Upload original document
        file_content = await file.read()
        original_doc_url = await storage_service.upload_file(
            file_content, f"original_docs/{verification_id}_{file.filename}"
        )
        verification_data["original_doc_url"] = original_doc_url

        # Save initial verification record
        supabase.table("verifications").insert(verification_data).execute()

        # Process the image through the pipeline
        result = await inference_pipeline.process(
            image_bytes=file_content,
            reference_sig_url=reference_sig_url,
            verification_id=verification_id
        )

        # Upload processed images
        if result.get("detected_sig"):
            detected_url = await storage_service.upload_file(
                result["detected_sig"], f"detected/{verification_id}_detected.jpg"
            )
        else:
            detected_url = None

        if result.get("cleaned_sig"):
            cleaned_url = await storage_service.upload_file(
                result["cleaned_sig"], f"cleaned/{verification_id}_cleaned.jpg"
            )
        else:
            cleaned_url = None

        # Update verification record
        confidence_score = result.get("confidence_score", 0.0)
        status = "success" if confidence_score >= 0.7 else "failed"

        supabase.table("verifications").update({
            "cleaned_sig_url": cleaned_url,
            "confidence_score": confidence_score,
            "status": status
        }).eq("id", verification_id).execute()

        return VerificationResponse(
            verification_id=verification_id,
            detected_sig_url=detected_url,
            cleaned_sig_url=cleaned_url,
            confidence_score=confidence_score,
            status=status,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        # Update verification status to failed
        if 'verification_id' in locals():
            try:
                supabase.table("verifications").update({
                    "status": "failed"
                }).eq("id", verification_id).execute()
            except:
                pass

        raise HTTPException(status_code=500, detail=str(e))


@app.get("/verifications/{user_id}")
async def get_verifications(user_id: str):
    """Get all verifications for a user"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("verifications").select("*").eq("user_id", user_id).order("timestamp", desc=True).execute()
        return {"verifications": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {"profile": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

