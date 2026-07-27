"""
FastAPI application for the Research Assistant agent.
Serves the REST API, SSE Streaming, and static SPA.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import logging
from datetime import datetime
from pathlib import Path
import os

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from agent.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Research Assistant API",
    description="Tool-using LLM agent backend with web search, weather, news, math, arxiv, github, and wikipedia capabilities",
    version="1.0.0"
)

# Parse CORS Origins from environment
raw_cors = os.getenv("CORS_ORIGINS", "*")
if raw_cors == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

# Add Vercel production origin by default if present
allowed_origins.extend([
    "https://research-assistant.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "X-Request-ID"]
)

# Add GZip Compression for non-streaming responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Static files directory
STATIC_DIR = Path(__file__).parent / "static"


START_TIME = datetime.now()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Render/Vercel uptime monitoring."""
    uptime = str(datetime.now() - START_TIME)
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=os.getenv("ENVIRONMENT", "production"),
        timestamp=datetime.now().isoformat(),
        uptime=uptime,
        llm="groq"
    )


# Import routes after app is created to avoid circular imports
from api.routes import router  # noqa

app.include_router(router, prefix="/agent", tags=["agent"])

# Mount static assets directory if present
ASSETS_DIR = STATIC_DIR / "assets"
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/{full_path:path}")
async def serve_spa_or_index(full_path: str):
    """Serve SPA index.html for all non-API paths to support client-side routing."""
    # Check if a static file directly exists in STATIC_DIR
    target_file = STATIC_DIR / full_path
    if full_path and target_file.exists() and target_file.is_file():
        return FileResponse(str(target_file))

    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")

    return JSONResponse(
        status_code=404,
        content={
            "name": "AI Research Assistant API",
            "version": "1.0.0",
            "message": "UI build not found in api/static. Running in headless API mode.",
            "endpoints": {
                "health": "/health",
                "agent_query": "/agent/query",
                "agent_stream": "/agent/stream",
                "docs": "/docs"
            }
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
