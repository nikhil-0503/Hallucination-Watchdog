"""
WATCHDOG - FastAPI Application
Production-grade AI Safety Gateway

Entry point for the WATCHDOG backend infrastructure.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

from .api.routes import router

# Load environment variables from project root
# Note: .env should be at D:\Projects\Hallucination-Watchdog\.env
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
# MIDDLEWARE CONFIGURATION
# ============================================

# CORS - Allow frontend to communicate with backend
# In production, restrict origins to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# ROUTE REGISTRATION
# ============================================

app.include_router(router)


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
            "health": "GET /api/health - Service health check"
        },
        "description": "Real-time AI safety enforcement layer"
    }


# ============================================
# APPLICATION STARTUP
# ============================================

if __name__ == "__main__":
    # Configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    # Start server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
