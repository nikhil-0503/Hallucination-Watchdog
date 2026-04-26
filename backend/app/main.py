"""
WATCHDOG - FastAPI Application
Production-grade AI Safety Gateway

Entry point for the WATCHDOG backend infrastructure.
"""

import os
import time
import logging
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import uvicorn

from .api.routes import router
from .proxy.llm_proxy import llm_proxy

logger = logging.getLogger(__name__)

# Import demo_handler using absolute path (relative .. fails when app is imported as top-level)
import sys
_backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)
from demo_handler import router as demo_router

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

# ============================================
# APPLICATION INITIALIZATION
# ============================================

app = FastAPI(
    title="WATCHDOG AI Safety Gateway",
    description="""
    Real-time AI hallucination detection and output control system.
    
    **What WATCHDOG does:**
    - Intercepts LLM requests/responses
    - Analyzes risk in real-time
    - Enforces safety rules (ALLOW/WARN/BLOCK)
    - Prevents harmful outputs from reaching users
    
    **Architecture:**
    - Model-agnostic (works with any LLM)
    - Enforcement-first design
    - Production-ready infrastructure
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================
# RATE LIMITING MIDDLEWARE
# ============================================

# Simple in-memory rate limiting
request_counts = {}
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "100"))  # requests per minute
RATE_WINDOW = 60  # seconds


def _clean_origin_value(raw: str) -> str:
    cleaned = raw.strip().strip('"').strip("'").rstrip("/")
    return cleaned


def _parse_cors_origins(raw: str | None) -> list[str]:
    if raw is None:
        return []

    raw = raw.strip()
    if not raw:
        return []
    if raw == "*":
        return ["*"]

    origins: list[str] = []
    for origin in raw.split(","):
        cleaned = _clean_origin_value(origin)
        if cleaned:
            origins.append(cleaned)
    return origins


def _resolve_cors_allowlist() -> list[str]:
    configured = _parse_cors_origins(os.getenv("CORS_ORIGINS"))

    # FRONTEND_URL is commonly used on Railway and should be accepted even when
    # CORS_ORIGINS is omitted or contains malformed values.
    frontend_url = _clean_origin_value(os.getenv("FRONTEND_URL", ""))
    if frontend_url and frontend_url not in configured:
        configured.append(frontend_url)

    # Always include the known Railway frontend URL for this deployment
    railway_frontend = "https://hallucination-watchdog-frontend-production.up.railway.app"
    if railway_frontend not in configured:
        configured.append(railway_frontend)

    if configured:
        return configured

    # Default to permissive CORS. This is safe because allow_credentials=False.
    # Set CORS_ORIGINS env var explicitly if you need strict origin checking.
    return ["*"]

# ============================================
# CORS MIDDLEWARE CONFIGURATION
# ============================================
# NOTE: In Starlette/FastAPI, middleware registered via add_middleware() is
# applied in LIFO order (last registered = outermost = executes first).
# @app.middleware("http") decorators are inserted before add_middleware() calls
# in the stack, meaning they execute AFTER add_middleware middlewares.
#
# By registering CORSMiddleware BEFORE the rate-limiting @app.middleware("http")
# decorator, CORS becomes the outermost layer and runs first — ensuring
# Access-Control-Allow-Origin headers are present on every response, including
# 429 errors and OPTIONS preflight responses.

app.add_middleware(
    CORSMiddleware,
    allow_origins=_resolve_cors_allowlist(),
    allow_origin_regex=r"https://.*\.railway\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# RATE LIMITING MIDDLEWARE
# ============================================

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware: 100 requests per minute per IP.
    Returns 429 Too Many Requests if limit exceeded.
    """
    # Skip rate limiting for health checks and CORS preflight requests.
    if request.url.path == "/api/health" or request.method.upper() == "OPTIONS":
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Clean old entries
    for ip in list(request_counts.keys()):
        request_counts[ip] = [t for t in request_counts[ip] if now - t < RATE_WINDOW]
        if not request_counts[ip]:
            del request_counts[ip]
    
    # Check rate limit
    if client_ip in request_counts and len(request_counts[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "limit": RATE_LIMIT,
                "window": f"{RATE_WINDOW}s",
                "retry_after": int(RATE_WINDOW - (now - request_counts[client_ip][0]))
            }
        )
    
    # Record request
    if client_ip not in request_counts:
        request_counts[client_ip] = []
    request_counts[client_ip].append(now)
    
    response = await call_next(request)
    return response


# ============================================
# ROUTE REGISTRATION
# ============================================

app.include_router(router)
app.include_router(demo_router)


# ============================================
# ROOT ENDPOINT
# ============================================

@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "service": "WATCHDOG AI Safety Gateway",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "analyze": "POST /api/analyze - Analyze and enforce safety on LLM outputs",
            "health": "GET /api/health - Service health check",
            "metrics": "GET /metrics - Performance metrics"
        },
        "description": "Real-time AI safety enforcement layer"
    }


# ============================================
# PERFORMANCE METRICS ENDPOINT
# ============================================

@app.get("/metrics")
async def get_metrics():
    """
    **Performance Monitoring Metrics**
    
    Returns current system metrics for monitoring:
    - Request counts
    - Rate limiting status
    - System health
    """
    total_requests = sum(len(times) for times in request_counts.values())
    active_ips = len(request_counts)
    
    return {
        "timestamp": datetime.now().isoformat(),
        "service": "WATCHDOG AI Safety Gateway",
        "metrics": {
            "active_connections": active_ips,
            "requests_in_window": total_requests,
            "rate_limit": RATE_LIMIT,
            "rate_window_seconds": RATE_WINDOW,
            "status": "healthy"
        },
        "version": "1.0.0"
    }


# ============================================
# STARTUP DIAGNOSTICS
# ============================================

_cors_origins = _resolve_cors_allowlist()
logger.info(f"WATCHDOG starting — CORS origins: {_cors_origins}")
logger.info(f"LLM provider: {llm_proxy.provider}, mock_mode: {llm_proxy.mock_mode}, api_key_configured: {bool(llm_proxy.gemini_api_key or llm_proxy.api_key)}")


# ============================================
# APPLICATION STARTUP
# ============================================

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
