import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.api import auth, chat, websockets
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.elasticsearch import get_elasticsearch_client

# Import models package first to ensure relationships are set up
import app.models

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)
app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chat",
    tags=["chat"],
)
app.include_router(
    websockets.router,
    prefix=f"{settings.API_V1_STR}/chat",
    tags=["websockets"],
)

# Log available routes for debugging
for route in app.routes:
    logger.info(f"Available route: {route.path} [{', '.join(route.methods) if hasattr(route, 'methods') else 'WebSocket'}]")
    

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors.
    """
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    """
    Run on application startup.
    """
    logger.info("Starting up application")
    # Initialize Elasticsearch
    try:
        es_client = get_elasticsearch_client()
        logger.info("Connected to Elasticsearch")
    except Exception as e:
        logger.error(f"Error connecting to Elasticsearch: {e}")
        # Continue anyway - the application can work without Elasticsearch


@app.on_event("shutdown")
async def shutdown_event():
    """
    Run on application shutdown.
    """
    logger.info("Shutting down application")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)