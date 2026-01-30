"""
WATCHDOG - Request/Response Schemas
Production-grade Pydantic models for API validation
"""

from enum import Enum
from typing import Dict, Optional
from pydantic import BaseModel, Field


class DomainType(str, Enum):
    """Supported domain types for content analysis"""
    GENERAL = "general"
    HEALTH = "health"
    FINANCE = "finance"


class ActionType(str, Enum):
    """Enforcement action types"""
    ALLOW = "ALLOW"
    WARN = "WARN"
    BLOCK = "BLOCK"


# ============================================
# REQUEST SCHEMAS
# ============================================

class AnalyzeRequest(BaseModel):
    """Request schema for /analyze endpoint"""
    prompt: str = Field(..., min_length=1, description="User prompt to analyze")
    domain: DomainType = Field(default=DomainType.GENERAL, description="Content domain")

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "What are the side effects of ibuprofen?",
                "domain": "health"
            }
        }


# ============================================
# INTERNAL SCHEMAS (Risk Engine Interface)
# ============================================

class RiskSignals(BaseModel):
    """Risk detection signals from risk engine"""
    rag_unverified: bool = Field(default=False)
    internal_contradiction: bool = Field(default=False)
    overconfidence: bool = Field(default=False)


class RiskReport(BaseModel):
    """Risk engine output format (mocked for now)"""
    risk_score: int = Field(..., ge=0, le=100, description="Risk score 0-100")
    signals: RiskSignals
    explanation: str = Field(..., description="Human-readable risk explanation")


# ============================================
# RESPONSE SCHEMAS
# ============================================

class AnalyzeResponse(BaseModel):
    """
    Final response returned to client
    
    ENFORCEMENT BEHAVIOR:
    - ALLOW: response contains LLM output as-is
    - WARN: response contains LLM output + risk metadata
    - BLOCK: response is "The output cannot be displayed."
    """
    final_action: ActionType = Field(..., description="Enforcement decision")
    response: str = Field(..., description="User-visible response text")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score from analysis")
    explanation: str = Field(..., description="Explanation of action taken")
    
    # Optional metadata for debugging (not shown in production)
    metadata: Optional[Dict] = Field(default=None, description="Additional debug info")

    class Config:
        json_schema_extra = {
            "example": {
                "final_action": "WARN",
                "response": "Ibuprofen may cause stomach upset, nausea...",
                "risk_score": 65,
                "explanation": "Unverified medical claims detected with moderate confidence"
            }
        }
