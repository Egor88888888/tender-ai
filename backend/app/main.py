from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers will be registered here
try:
    from .api.v1 import router as api_router  # type: ignore
except ImportError:
    # during initial scaffolding router may not yet exist
    api_router = None  # pylint: disable=invalid-name


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(title="Tender AI", version="0.1.0")

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
    async def root():  # noqa: D401
        """Health-check endpoint."""
        return {"status": "ok"}

    return app


app = create_app()
