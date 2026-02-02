"""
WATCHDOG - API Routes
FastAPI endpoints for the AI safety gateway
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from typing import List
import sys
import os

# Add backend root to path for sibling modules
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from ..schemas import (
    AnalyzeRequest, AnalyzeResponse, ActionType,
    ChatRequest, ChatResponse, PromptRecord
)
from ..proxy.llm_proxy import get_llm_response
from ..proxy.enforcement import get_risk_report, apply_enforcement, get_enforcement_metadata
from ..storage import save_prompt_record, get_all_prompts, get_prompt_by_id
from audit.audit_logger import log_decision

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["watchdog"])


# ============================================
# NEW CORE ENDPOINT: /chat
# ============================================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_watchdog(request: ChatRequest):
    """
    **WATCHDOG Chat Endpoint - Full Pipeline**
    
    Complete flow:
    1. Forward prompt to LLM → get raw answer
    2. Run Risk Engine → calculate confidence, RAG status, contradiction
    3. Run Policy Engine → decide ALLOW/WARN/BLOCK
    4. Apply enforcement → generate user-safe output
    5. Log to Audit Logger
    6. Save record to storage
    7. Return response (admin gets full metadata, user gets safe output only)
    
    **Enforcement Rule:**
    If action == BLOCK: return only "The output cannot be displayed."
    Else: return the real LLM answer
    """
    try:
        logger.info(f"Chat request - Role: {request.role}, Prompt length: {len(request.prompt)}")
        
        # ============================================
        # STEP 1: Get LLM raw answer
        # ============================================
        llm_response = await get_llm_response(
            prompt=request.prompt,
            domain=request.domain.value
        )
        logger.info(f"LLM response received - Length: {len(llm_response)}")
        
        # ============================================
        # STEP 2: Risk Engine Analysis
        # ============================================
        risk_report = await get_risk_report(
            prompt=request.prompt,
            llm_response=llm_response,
            domain=request.domain.value
        )
        
        # Extract risk engine data
        risk_score = risk_report.risk_score
        # Prefer the risk engine's trust_score (0-1). Fall back to inverse risk if missing.
        trust_score = None
        try:
            trust_score = getattr(risk_report, "trust_score", None)
        except Exception:
            trust_score = None

        if trust_score is None:
            confidence = (100 - risk_score) / 100.0
        else:
            confidence = float(trust_score)

        rag_status = "VERIFIED" if not risk_report.signals.rag_unverified else "UNVERIFIED"
        contradiction_check = "PASS" if not risk_report.signals.internal_contradiction else "FAIL"
        
        logger.info(f"Risk analysis - Score: {risk_score}, RAG: {rag_status}, Contradiction: {contradiction_check}")
        
        # ============================================
        # STEP 3: Policy Engine Decision
        # ============================================
        action, user_visible_answer = apply_enforcement(
            risk_report=risk_report,
            llm_response=llm_response,
            user_context={'domain': request.domain.value}
        )
        logger.warning(f"ENFORCEMENT - Action: {action.value}, Risk: {risk_score}")
        
        if action == ActionType.BLOCK:
            logger.critical("OUTPUT BLOCKED - User will NOT see LLM response")
        
        # ============================================
        # STEP 4: Audit Logger
        # ============================================
        log_decision({
            'prompt': request.prompt,
            'gpt_response': llm_response,
            'final_response': user_visible_answer,
            'action': action.value,
            'risk_score': risk_score,
            'rag_status': rag_status,
            'contradiction_check': contradiction_check,
            'explanation': risk_report.explanation
        })
        
        # ============================================
        # STEP 5: Save to Storage
        # ============================================
        # include optional warning_text in metadata when a WARN action occurred
        warning_text = None
        if action == ActionType.WARN:
            warning_text = "⚠️ Warning: This response may be unreliable. Please verify before acting."

        record_id = save_prompt_record(
            prompt=request.prompt,
            gpt_raw_answer=llm_response,
            user_visible_answer=user_visible_answer,
            confidence=confidence,  # already 0-1 range
            rag_status=rag_status,
            contradiction_check=contradiction_check,
            action=action.value,
            risk_score=risk_score,
            explanation=risk_report.explanation,
            metadata={
                "signals": risk_report.signals.model_dump(),
                "risk_score": risk_report.risk_score,
                "warning_text": warning_text
            }
        )
        
        logger.info(f"Record saved - ID: {record_id}")
        
        # ============================================
        # STEP 6: Return Response
        # ============================================
        if request.role == "admin":
            # Admin gets full metadata
            return ChatResponse(
                id=record_id,
                user_output=user_visible_answer,
                action=action,
                timestamp=get_prompt_by_id(record_id)["timestamp"],
                prompt=request.prompt,
                gpt_raw_answer=llm_response,
                confidence=confidence,
                rag_status=rag_status,
                contradiction_check=contradiction_check,
                risk_score=risk_score,
                explanation=risk_report.explanation,
                metadata=risk_report.metadata,
                warning_text=warning_text
            )
        else:
            # User gets only safe output
            return ChatResponse(
                id=record_id,
                user_output=user_visible_answer,
                action=action,
                confidence=confidence,
                warning_text=warning_text
            )
        
    except Exception as e:
        logger.error(f"Chat request failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat request failed: {str(e)}"
        )


# ============================================
# GET ALL PROMPTS
# ============================================

@router.get("/prompts", response_model=List[PromptRecord])
async def get_prompts():
    """
    Get all stored prompt records.
    
    Returns list ordered by timestamp (newest first).
    Used by Admin Dashboard and Activity Logs.
    """
    try:
        records = get_all_prompts()
        logger.info(f"Retrieved {len(records)} prompt records")
        return records
    except Exception as e:
        logger.error(f"Failed to retrieve prompts: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve prompts: {str(e)}"
        )


# ============================================
# GET SINGLE PROMPT BY ID
# ============================================

@router.get("/prompts/{prompt_id}", response_model=PromptRecord)
async def get_prompt(prompt_id: int):
    """
    Get a single prompt record by ID.
    
    Used by Current Prompt Analysis page.
    """
    try:
        record = get_prompt_by_id(prompt_id)
        if record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prompt with ID {prompt_id} not found"
            )
        logger.info(f"Retrieved prompt record - ID: {prompt_id}")
        return record
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve prompt {prompt_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve prompt: {str(e)}"
        )


# ============================================
# CORE ENDPOINT: /analyze
# ============================================

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_prompt(request: AnalyzeRequest):
    """
    **WATCHDOG Core Endpoint**
    
    Complete flow:
    1. Receive user prompt
    2. Forward to LLM proxy
    3. Get raw LLM response
    4. Send to risk engine for analysis
    5. Apply enforcement rules
    6. Return final decision + response
    
    **Enforcement Logic:**
    - ALLOW (risk < 50): Return LLM output as-is
    - WARN (50 ≤ risk < 80): Return LLM output with warning
    - BLOCK (risk ≥ 80): Return "The output cannot be displayed."
    """
    try:
        logger.info(f"Received analyze request - Domain: {request.domain}, Prompt length: {len(request.prompt)}")
        
        # ============================================
        # STEP 1: Forward prompt to LLM
        # ============================================
        llm_response = await get_llm_response(
            prompt=request.prompt,
            domain=request.domain.value
        )
        logger.info(f"LLM response received - Length: {len(llm_response)}")
        
        # ============================================
        # STEP 2: Get risk analysis
        # ============================================
        # In production, this calls a separate risk engine microservice
        # For now, it's mocked with intelligent heuristics
        risk_report = await get_risk_report(
            prompt=request.prompt,
            llm_response=llm_response,
            domain=request.domain.value
        )
        logger.info(f"Risk analysis complete - Score: {risk_report.risk_score}, Action likely: {_predict_action(risk_report.risk_score)}")
        
        # ============================================
        # STEP 3: Apply enforcement rules
        # ============================================
        # **THIS IS WHERE WATCHDOG ENFORCES SAFETY**
        action, final_response = apply_enforcement(
            risk_report=risk_report,
            llm_response=llm_response,
            user_context={'domain': request.domain.value}
        )
        logger.warning(f"ENFORCEMENT APPLIED - Action: {action.value}, Risk: {risk_report.risk_score}")
        
        if action == ActionType.BLOCK:
            logger.critical(f"OUTPUT BLOCKED - Risk score {risk_report.risk_score} - User will NOT see LLM response")
        
        # ============================================
        # STEP 4: Generate metadata
        # ============================================
        metadata = get_enforcement_metadata(
            action=action,
            risk_report=risk_report,
            prompt=request.prompt,
            llm_response=llm_response
        )
        
        # ============================================
        # STEP 5: Return final response
        # ============================================
        response = AnalyzeResponse(
            final_action=action,
            response=final_response,
            risk_score=risk_report.risk_score,
            explanation=risk_report.explanation,
            metadata=metadata
        )
        
        logger.info(f"Request complete - Final action: {action.value}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing request: {str(e)}"
        )


# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "service": "WATCHDOG AI Safety Gateway",
        "version": "1.0.0"
    }


# ============================================
# UTILITY FUNCTIONS
# ============================================

def _predict_action(risk_score: int) -> str:
    """Helper to predict action for logging"""
    if risk_score >= 80:
        return "BLOCK"
    elif risk_score >= 50:
        return "WARN"
    else:
        return "ALLOW"
