"""
WATCHDOG Risk Engine - Main Analyzer

This is the main entry point for the WATCHDOG risk analysis system.

Coordinates signal detection and risk scoring to produce structured
risk assessments for LLM responses.

Includes TRUST INTELLIGENCE features for business-grade safety assessment.

DOES NOT make enforcement decisions (ALLOW/WARN/BLOCK).
Only estimates risk and provides explainable output.
"""

from typing import Dict, List, Optional
from .signals import extract_all_signals
from .scorer import (
    calculate_risk_score, 
    generate_explanation, 
    get_risk_level,
    calculate_trust_score,
    get_domain_multiplier,
    generate_business_impact
)


def analyze(
    prompt: str,
    llm_response: str,
    rag_results: Optional[List[Dict]] = None
) -> Dict:
    """
    Main risk analysis function for WATCHDOG with TRUST INTELLIGENCE.
    
    Analyzes an LLM response for hallucination signals and calculates
    risk + trust scores. Works with or without RAG data.
    
    Process:
    1. Extract atomic claims from response
    2. Verify claims against RAG (if available)
    3. Detect overconfidence and contradictions
    4. Calculate claim-level confidence scores
    5. Detect time sensitivity and domain
    6. Calculate aggregate risk score
    7. Calculate trust score with domain multipliers
    8. Generate human-readable explanation and business impact
    
    Args:
        prompt: User's original question/prompt
        llm_response: Raw text output from the LLM
        rag_results: Optional list of RAG documents
                     Format: [{"content": "...", "metadata": {...}}, ...]
                     If None, analysis proceeds without RAG verification
                     
    Returns:
        Risk analysis result in standardized format:
        {
            # Original fields (preserved)
            "risk_score": int (0-100),
            "signals": {
                "rag_contradiction": bool,
                "rag_unverified": bool,
                "internal_contradiction": bool,
                "overconfidence": bool
            },
            "explanation": str,
            "claims": [
                {
                    "text": str,
                    "rag_status": str (SUPPORTED/CONTRADICTED/UNVERIFIED),
                    "confidence": float (0-1),  # NEW
                    "depends_on": list[int]     # NEW
                },
                ...
            ],
            
            # NEW: Trust Intelligence fields
            "trust_score": float (0-1),
            "time_sensitivity": str (LOW/MEDIUM/HIGH),
            "domain_multiplier": float,
            "business_impact": str
        }
        
    Example:
        >>> result = analyze(
        ...     prompt="When did SSN College close?",
        ...     llm_response="SSN College definitely closed in 2026.",
        ...     rag_results=None
        ... )
        >>> result["risk_score"]
        35
        >>> result["trust_score"]
        0.31
        >>> result["signals"]["overconfidence"]
        True
    """
    # Input validation
    if not llm_response or not llm_response.strip():
        return {
            "risk_score": 0,
            "signals": {
                "rag_contradiction": False,
                "rag_unverified": False,
                "internal_contradiction": False,
                "overconfidence": False,
            },
            "explanation": "Empty response - no risk detected",
            "claims": [],
            # TRUST INTELLIGENCE fields for empty response
            "trust_score": 0.5,  # FIXED: Neutral trust, not perfect (empty = no evidence)
            "time_sensitivity": "LOW",
            "domain_multiplier": 1.0,
            "business_impact": "No content to assess - neutral trust",
        }
    
    # Step 1: Extract all signals (including trust intelligence)
    signals = extract_all_signals(prompt, llm_response, rag_results)
    
    # Step 2: Calculate base risk score
    signal_flags = {
        "rag_contradiction": signals["rag_contradiction"],
        "rag_unverified": signals["rag_unverified"],
        "internal_contradiction": signals["internal_contradiction"],
        "overconfidence": signals["overconfidence"],
    }
    
    base_risk_score = calculate_risk_score(signal_flags)
    
    # Step 3: TRUST INTELLIGENCE - Extract trust features (needed for multiplier)
    domain = signals.get("domain", "general")
    time_sensitivity = signals.get("time_sensitivity", "MEDIUM")
    claim_confidences = signals.get("claim_confidences", {})
    claim_dependencies = signals.get("claim_dependencies", {})
    
    # Step 4: TRUST INTELLIGENCE - Get domain multiplier
    domain_multiplier = get_domain_multiplier(domain)
    
    # Step 5: APPLY DOMAIN MULTIPLIER TO RISK SCORE (CRITICAL FIX)
    # Sensitive domains (health 1.5x, legal 1.6x) get higher risk scores
    risk_score = min(int(base_risk_score * domain_multiplier), 100)
    
    # Step 6: Generate explanation with final risk score
    explanation = generate_explanation(signals, risk_score)

    # Step 6b: Auto-block override - if signals indicate immediate block, push score high
    if signals.get('auto_block'):
        # Ensure high risk to force blocking by policy
        risk_score = max(risk_score, 95)
        explanation = explanation + "; Auto-block rule triggered"
    
    # Step 7: TRUST INTELLIGENCE - Calculate trust score
    # Use full signals dict so trust can react to auto_block and detailed flags
    trust_score = calculate_trust_score(
        risk_score=risk_score,
        signals=signals,
        domain=domain,
        time_sensitivity=time_sensitivity,
        claim_confidences=claim_confidences
    )
    
    # Step 8: TRUST INTELLIGENCE - Generate business impact
    business_impact = generate_business_impact(
        trust_score=trust_score,
        risk_score=risk_score,
        domain=domain,
        time_sensitivity=time_sensitivity,
        signals=signals
    )
    
    # Step 9: Format claims for output (with trust intelligence)
    claims_output = []
    for i, claim in enumerate(signals["claims"]):
        rag_status = signals["claim_verification"].get(claim, "UNVERIFIED")
        confidence = claim_confidences.get(claim, 0.5)
        depends_on = claim_dependencies.get(str(i), [])
        
        claims_output.append({
            "text": claim,
            "rag_status": rag_status,
            "confidence": round(confidence, 3),  # NEW: claim confidence
            "depends_on": depends_on,            # NEW: claim dependencies
        })
    
    # Step 10: Return standardized output (extended with trust intelligence)
    return {
        # Original fields (preserved)
        "risk_score": risk_score,
        "signals": signal_flags,
        "explanation": explanation,
        "claims": claims_output,
        
        # NEW: Trust Intelligence fields
        "trust_score": round(trust_score, 3),
        "time_sensitivity": time_sensitivity,
        "domain_multiplier": domain_multiplier,
        "business_impact": business_impact,
        # Auto-block fields
        "auto_block": signals.get('auto_block', False),
        "auto_block_reasons": signals.get('auto_block_reasons', []),
    }


def analyze_batch(requests: List[Dict]) -> List[Dict]:
    """
    Analyze multiple LLM responses in batch.
    
    Useful for processing multiple responses efficiently.
    
    Args:
        requests: List of dicts, each containing:
                  - prompt: str
                  - llm_response: str
                  - rag_results: Optional[List[Dict]]
                  
    Returns:
        List of analysis results in the same order
    """
    results = []
    
    for request in requests:
        result = analyze(
            prompt=request.get("prompt", ""),
            llm_response=request.get("llm_response", ""),
            rag_results=request.get("rag_results"),
        )
        results.append(result)
    
    return results


def get_version() -> str:
    """
    Return WATCHDOG risk engine version.
    
    Returns:
        Version string
    """
    return "1.0.0"


def get_system_info() -> Dict:
    """
    Return system information and configuration.
    
    Useful for debugging and transparency.
    
    Returns:
        Dict containing system metadata
    """
    from .scorer import RISK_WEIGHTS
    
    return {
        "version": get_version(),
        "risk_weights": RISK_WEIGHTS,
        "supported_rag": True,
        "graceful_degradation": True,
        "description": "Real-time AI hallucination detection and risk scoring system",
    }


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def is_high_risk(result: Dict) -> bool:
    """Check if analysis result indicates high risk (score >= 70)."""
    return result["risk_score"] >= 70


def is_medium_risk(result: Dict) -> bool:
    """Check if analysis result indicates medium risk (score 35-69)."""
    return 35 <= result["risk_score"] < 70


def is_low_risk(result: Dict) -> bool:
    """Check if analysis result indicates low risk (score < 35)."""
    return result["risk_score"] < 35


def has_contradictions(result: Dict) -> bool:
    """Check if analysis detected any contradictions."""
    signals = result["signals"]
    return signals["rag_contradiction"] or signals["internal_contradiction"]


def has_unverified_claims(result: Dict) -> bool:
    """Check if analysis found unverified claims."""
    return result["signals"]["rag_unverified"]
