"""
WATCHDOG - Enforcement Engine
Core enforcement logic: ALLOW / WARN / BLOCK decisions

THIS IS THE CRITICAL COMPONENT - WHERE WATCHDOG PROVES ITS VALUE
"""

import asyncio
from typing import Dict, Tuple
import sys
import os

# Add backend root to path for sibling modules
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from ..schemas import ActionType, RiskReport, RiskSignals
from risk_engine.analyzer import analyze
from policies.policy_engine import enforce_policy
from audit.audit_logger import log_decision


# ============================================
# INTEGRATED RISK ENGINE
# ============================================

async def get_risk_report(prompt: str, llm_response: str, domain: str) -> RiskReport:
    """
    Call to integrated WATCHDOG risk engine
    
    Uses Member2's risk engine for:
    - RAG verification against knowledge base
    - Internal contradiction detection
    - Overconfidence analysis
    - Domain-specific validation
    
    Args:
        prompt: Original user prompt
        llm_response: Raw LLM output
        domain: Content domain
        
    Returns:
        RiskReport with score, signals, and explanation
    """
    try:
        # Use Member2's risk engine analyzer
        risk_analysis = analyze(
            prompt=prompt,
            llm_response=llm_response,
            rag_results=None  # No RAG data for now
        )
        
        # Convert to our schema format
        risk_score = risk_analysis.get('risk_score', 30)
        explanation = risk_analysis.get('explanation', 'Risk analysis completed')

        # Extract signals
        signals = RiskSignals(
            rag_unverified=risk_analysis.get('rag_unverified', False),
            internal_contradiction=risk_analysis.get('internal_contradiction', False),
            overconfidence=risk_analysis.get('overconfidence', False)
        )

        # Include auto-block hints in metadata for auditing
        metadata = risk_analysis.get('metadata', {}) or {}
        metadata['auto_block'] = risk_analysis.get('auto_block', False)
        metadata['auto_block_reasons'] = risk_analysis.get('auto_block_reasons', [])

        return RiskReport(
            risk_score=risk_score,
            signals=signals,
            explanation=explanation,
            trust_score=risk_analysis.get('trust_score'),
            metadata=metadata
        )
    
    except Exception as e:
        # Fallback to conservative high-risk assessment if analysis fails
        print(f"Risk analysis failed: {e}")
        return RiskReport(
            risk_score=85,  # High risk on failure
            signals=RiskSignals(
                rag_unverified=True,
                internal_contradiction=True,
                overconfidence=True
            ),
            explanation=f"Risk analysis failed: {str(e)}",
            metadata={"error": str(e)}
        )
    if any(word in response_lower for word in [
        "cure cancer", "miracle drug", "insider information",
        "guarantee", "definitely will", "mortgage your house"
    ]):
        risk_score = 85
        signals.rag_unverified = True
        signals.overconfidence = True
        explanation = "High risk - unverified claims with extreme confidence"
    
    # MEDIUM RISK INDICATORS (score 50-79)
    elif any(word in response_lower for word in [
        "absolutely", "certainly", "zero side effects",
        "definitely", "500%", "instantly"
    ]):
        risk_score = 65
        signals.overconfidence = True
        signals.rag_unverified = True
        explanation = "Moderate risk - overconfident language with unverified factual claims"
    
    # Domain-specific adjustments
    if domain == "health" and any(word in response_lower for word in ["safe to take", "pills at once"]):
        risk_score = min(risk_score + 20, 95)
        signals.rag_unverified = True
        explanation = "High risk - potentially dangerous medical advice"
    
    if domain == "finance" and any(word in response_lower for word in ["invest all", "social media buzz"]):
        risk_score = min(risk_score + 15, 95)
        signals.overconfidence = True
        explanation = "High risk - speculative financial advice without disclaimers"
    
    return RiskReport(
        risk_score=risk_score,
        signals=signals,
        explanation=explanation
    )


# ============================================
# ENFORCEMENT RULES (CORE LOGIC)
# ============================================

def apply_enforcement(risk_report: RiskReport, llm_response: str, user_context: Dict = None) -> Tuple[ActionType, str]:
    """
    Apply WATCHDOG enforcement rules using integrated policy engine
    
    **THIS IS WHERE ENFORCEMENT HAPPENS**
    
    Uses Member4's policy engine to make ALLOW/WARN/BLOCK decisions
    and logs all decisions to audit system
    
    Args:
        risk_report: Risk analysis from risk engine
        llm_response: Raw LLM output
        user_context: Optional user context for policy decisions
        
    Returns:
        Tuple of (action, final_response)
        - action: ALLOW / WARN / BLOCK
        - final_response: What the user actually sees
    """
    try:
        # Use Member4's policy engine for enforcement decision
        policy_decision = enforce_policy(
            risk_score=risk_report.risk_score,
            signals=risk_report.signals,
            user_context=user_context or {}
        )
        
        action = ActionType(policy_decision['action'])
        
        # Apply enforcement based on policy decision
        if action == ActionType.BLOCK:
            # BLOCK: User never sees the LLM output - core safety feature
            final_response = "The output cannot be displayed."
            
        elif action == ActionType.WARN:
            # WARN: Allow but mark as potentially risky
            final_response = llm_response  # Pass through as-is
            
        else:  # ALLOW
            # ALLOW: Low risk, pass through without modification
            final_response = llm_response
        
        # Log decision to audit system (Member4)
        log_decision({
            'action': action.value,
            'risk_score': risk_report.risk_score,
            'explanation': risk_report.explanation,
            'llm_response_length': len(llm_response),
            'final_response_length': len(final_response)
        })
        
        return action, final_response
        
    except Exception as e:
        # Fallback to conservative BLOCK if policy engine fails
        print(f"Policy enforcement failed: {e}")
        log_decision({
            'action': 'BLOCK',
            'risk_score': 95,
            'explanation': f'Policy enforcement failure: {str(e)}',
            'error': True
        })
        return ActionType.BLOCK, "The output cannot be displayed."


# ============================================
# ENFORCEMENT METADATA
# ============================================

def get_enforcement_metadata(
    action: ActionType,
    risk_report: RiskReport,
    prompt: str,
    llm_response: str
) -> Dict:
    """
    Generate metadata for logging/debugging
    
    This is NOT shown to end users in production,
    but useful for monitoring and auditing
    """
    return {
        "action_taken": action.value,
        "risk_breakdown": {
            "score": risk_report.risk_score,
            "signals": {
                "rag_unverified": risk_report.signals.rag_unverified,
                "internal_contradiction": risk_report.signals.internal_contradiction,
                "overconfidence": risk_report.signals.overconfidence
            }
        },
        "was_blocked": action == ActionType.BLOCK,
        "prompt_length": len(prompt),
        "response_length": len(llm_response) if action != ActionType.BLOCK else 0
    }
