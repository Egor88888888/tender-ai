from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    """Health check for monitoring."""
    return {"status": "healthy"}
