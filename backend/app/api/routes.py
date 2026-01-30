"""
WATCHDOG - API Routes
FastAPI endpoints for the AI safety gateway
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import logging

from schemas import AnalyzeRequest, AnalyzeResponse, ActionType
from proxy.llm_proxy import get_llm_response
from proxy.enforcement import get_risk_report, apply_enforcement, get_enforcement_metadata

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["watchdog"])


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
