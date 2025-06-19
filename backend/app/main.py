import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from azure.storage.blob import BlobServiceClient
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from azure.ai import formrecognizer
from azure.identity import DefaultAzureCredential
import google.generativeai as genai
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
COGNITIVE_SERVICES_KEY = os.getenv("COGNITIVE_SERVICES_KEY")
COGNITIVE_SERVICES_ENDPOINT = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Azure services
blob_service_client = None
computer_vision_client = None
form_recognizer_client = None

if AZURE_STORAGE_CONNECTION_STRING:
    blob_service_client = BlobServiceClient.from_connection_string(
        AZURE_STORAGE_CONNECTION_STRING)

if COGNITIVE_SERVICES_KEY and COGNITIVE_SERVICES_ENDPOINT:
    from msrest.authentication import CognitiveServicesCredentials
    computer_vision_client = ComputerVisionClient(
        COGNITIVE_SERVICES_ENDPOINT,
        CognitiveServicesCredentials(COGNITIVE_SERVICES_KEY)
    )
    form_recognizer_client = formrecognizer.DocumentAnalysisClient(
        endpoint=COGNITIVE_SERVICES_ENDPOINT,
        credential=COGNITIVE_SERVICES_KEY
    )

# Initialize Gemini AI
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Database setup
engine = None
async_session = None

if DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False)

# Routers will be registered here
try:
    from .api.v1 import router as api_router  # type: ignore
except ImportError:
    # during initial scaffolding router may not yet exist
    api_router = None  # pylint: disable=invalid-name


async def get_db():
    """Database dependency."""
    if async_session is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title="Tender AI - Full Azure Stack",
        version="2.0.0",
        description="AI-powered tender analysis system with full Azure integration"
    )

    # Allow all origins for dev; restrict in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if api_router is not None:
        app.include_router(api_router, prefix="/api/v1")

    @app.get("/")
    async def root():
        """Health-check endpoint."""
        return {
            "status": "ok",
            "message": "Tender AI Full Stack is running",
            "version": "2.0.0",
            "features": {
                "database": DATABASE_URL is not None,
                "blob_storage": blob_service_client is not None,
                "computer_vision": computer_vision_client is not None,
                "form_recognizer": form_recognizer_client is not None,
                "gemini_ai": GEMINI_API_KEY is not None
            }
        }

    @app.get("/health")
    async def health():
        """Health-check endpoint for Azure Container Apps."""
        return {"status": "healthy", "service": "tender-ai-full-stack"}

    @app.post("/api/upload-document")
    async def upload_document(file: UploadFile = File(...)):
        """Upload and analyze document using Azure OCR."""
        if not blob_service_client:
            raise HTTPException(
                status_code=503, detail="Blob storage not configured")

        try:
            # Upload to blob storage
            blob_client = blob_service_client.get_blob_client(
                container="documents",
                blob=f"uploads/{file.filename}"
            )

            content = await file.read()
            blob_client.upload_blob(content, overwrite=True)

            # Analyze with Computer Vision OCR
            ocr_result = None
            if computer_vision_client:
                try:
                    blob_url = blob_client.url
                    read_operation = computer_vision_client.read(
                        blob_url, raw=True)
                    operation_id = read_operation.headers["Operation-Location"].split(
                        "/")[-1]

                    # Wait for OCR to complete
                    import time
                    while True:
                        read_result = computer_vision_client.get_read_result(
                            operation_id)
                        if read_result.status not in ['notStarted', 'running']:
                            break
                        time.sleep(1)

                    if read_result.status == OperationStatusCodes.succeeded:
                        text_results = []
                        for text_result in read_result.analyze_result.read_results:
                            for line in text_result.lines:
                                text_results.append(line.text)
                        ocr_result = "\n".join(text_results)
                except Exception as e:
                    logger.error(f"OCR error: {e}")
                    ocr_result = "OCR failed"

            return {
                "status": "success",
                "filename": file.filename,
                "blob_url": blob_client.url,
                "ocr_text": ocr_result,
                "size": len(content)
            }

        except Exception as e:
            logger.error(f"Upload error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/analyze-tender")
    async def analyze_tender(text: str):
        """Analyze tender using Gemini AI."""
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=503, detail="Gemini AI not configured")

        try:
            model = genai.GenerativeModel('gemini-pro')

            prompt = f"""
            Проанализируй следующий текст тендера и предоставь:
            1. Основные требования
            2. Критерии оценки
            3. Риски и возможности
            4. Рекомендации по участию
            
            Текст тендера:
            {text}
            """

            response = model.generate_content(prompt)

            return {
                "status": "success",
                "analysis": response.text,
                "model": "gemini-pro"
            }

        except Exception as e:
            logger.error(f"AI analysis error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/tenders")
    async def get_tenders(db: AsyncSession = Depends(get_db)):
        """Get all tenders from database."""
        # This would query the actual database
        # For now, return sample data
        return {
            "tenders": [
                {
                    "id": 1,
                    "title": "Поставка компьютерного оборудования",
                    "budget": 1000000,
                    "deadline": "2024-02-01",
                    "status": "active"
                }
            ]
        }

    @app.get("/api/storage-info")
    async def get_storage_info():
        """Get storage container information."""
        if not blob_service_client:
            raise HTTPException(
                status_code=503, detail="Blob storage not configured")

        try:
            containers = []
            for container in blob_service_client.list_containers():
                blob_count = len(
                    list(blob_service_client.get_container_client(container.name).list_blobs()))
                containers.append({
                    "name": container.name,
                    "blob_count": blob_count
                })

            return {"containers": containers}

        except Exception as e:
            logger.error(f"Storage info error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return app


app = create_app()
