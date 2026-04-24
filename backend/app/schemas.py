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


class ChatRequest(BaseModel):
    """Request schema for /chat endpoint"""
    prompt: str = Field(..., min_length=1, description="User prompt")
    role: str = Field(default="user", description="User role: 'user' or 'admin'")
    domain: DomainType = Field(default=DomainType.GENERAL, description="Content domain")

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "What are the side effects of ibuprofen?",
                "role": "user",
                "domain": "general"
            }
        }


# ============================================
# BIAS DETECTION SCHEMAS
# ============================================

class BiasAnalysisRequest(BaseModel):
    """Request schema for /analyze-bias endpoint"""
    decision: Dict = Field(..., description="Decision record to analyze for bias")
    historical_decisions: Optional[list] = Field(default=None, description="Historical decisions for comparison")
    outcome_field: str = Field(default="decision", description="Field name for decision outcome")

    class Config:
        json_schema_extra = {
            "example": {
                "decision": {
                    "applicant_id": "A123",
                    "age": 35,
                    "gender": "female",
                    "race": "black",
                    "credit_score": 720,
                    "decision": "approved"
                },
                "outcome_field": "decision"
            }
        }


class DatasetAuditRequest(BaseModel):
    """Request schema for /audit-dataset endpoint"""
    decisions: list = Field(..., min_items=1, description="List of decision records to audit")
    outcome_field: str = Field(default="decision", description="Field name for decision outcome")

    class Config:
        json_schema_extra = {
            "example": {
                "decisions": [
                    {"age": 35, "gender": "M", "decision": "approved"},
                    {"age": 28, "gender": "F", "decision": "denied"}
                ],
                "outcome_field": "decision"
            }
        }


class BiasScoreResponse(BaseModel):
    """Response schema for bias analysis"""
    decision_id: str = Field(..., description="ID of analyzed decision")
    timestamp: str = Field(..., description="Analysis timestamp")
    demographics: Dict = Field(..., description="Detected demographic attributes")
    bias_score: Dict = Field(..., description="Bias scoring metrics")
    gemini_analysis: Optional[Dict] = Field(default=None, description="Gemini AI analysis")
    recommendation: ActionType = Field(..., description="Enforcement recommendation")
    confidence: float = Field(..., ge=0, le=1, description="Confidence in analysis")

    class Config:
        json_schema_extra = {
            "example": {
                "decision_id": "D123",
                "timestamp": "2024-01-15T10:30:00Z",
                "demographics": {
                    "age": {"detected": True, "value": "35"},
                    "gender": {"detected": True, "value": "female"}
                },
                "bias_score": {
                    "score": 25.5,
                    "level": "MEDIUM",
                    "factors": {"demographic_parity": 18.5, "equal_opportunity": 22.0}
                },
                "recommendation": "WARN",
                "confidence": 0.85
            }
        }


class DatasetAuditResponse(BaseModel):
    """Response schema for dataset audit"""
    dataset_size: int = Field(..., description="Number of decisions audited")
    audit_timestamp: str = Field(..., description="Audit timestamp")
    fairness_metrics: Dict = Field(..., description="Fairness metrics by protected attribute")
    risky_decisions: list = Field(..., description="Decisions flagged for review")
    gemini_audit_report: Optional[str] = Field(default=None, description="Gemini audit report")
    overall_recommendation: ActionType = Field(..., description="Overall enforcement recommendation")
    summary: str = Field(..., description="Brief audit summary")

    class Config:
        json_schema_extra = {
            "example": {
                "dataset_size": 1000,
                "audit_timestamp": "2024-01-15T10:30:00Z",
                "fairness_metrics": {
                    "gender": {
                        "disparity_detected": True,
                        "disparity_gap": 0.15,
                        "description": "Concerning disparity detected"
                    }
                },
                "risky_decisions": [],
                "overall_recommendation": "WARN",
                "summary": "Significant disparities detected in gender-based decisions"
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
    # Optional trust score (0.0 - 1.0) computed by the risk engine
    trust_score: Optional[float] = Field(default=None, description="Trust score (0-1), higher is safer")
    # Optional additional metadata (diagnostics, claim breakdowns, etc.)
    metadata: Optional[Dict] = Field(default=None, description="Additional diagnostic metadata")


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


class ChatResponse(BaseModel):
    """Response schema for /chat endpoint"""
    id: int = Field(..., description="Unique record ID")
    user_output: str = Field(..., description="Safe response for user display")
    action: ActionType = Field(..., description="Enforcement action")
    # Optional field: human-friendly warning text for WARN responses
    warning_text: Optional[str] = Field(default=None, description="Optional warning text to show to users when action is WARN")
    # Admin-only fields (included only for admin role)
    timestamp: Optional[str] = Field(default=None)
    prompt: Optional[str] = Field(default=None)
    gpt_raw_answer: Optional[str] = Field(default=None)
    confidence: Optional[float] = Field(default=None)
    rag_status: Optional[str] = Field(default=None)
    contradiction_check: Optional[str] = Field(default=None)
    risk_score: Optional[int] = Field(default=None)
    explanation: Optional[str] = Field(default=None)
    metadata: Optional[Dict] = Field(default=None)


class PromptRecord(BaseModel):
    """Complete prompt record schema"""
    id: int
    timestamp: str
    prompt: str
    gpt_raw_answer: str
    user_visible_answer: str
    confidence: float
    rag_status: str
    contradiction_check: str
    action: str
    risk_score: int
    explanation: str
    metadata: Optional[Dict] = None

