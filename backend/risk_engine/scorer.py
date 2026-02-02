"""
WATCHDOG Risk Engine - Risk Scoring Module

This module:
- Calculates aggregate risk scores (0-100)
- Generates human-readable explanations
- Calculates trust scores (0-1) for public exposure safety
- Applies domain-aware risk multipliers
- Generates business impact assessments

Does NOT make enforcement decisions (ALLOW/WARN/BLOCK).
Outputs risk estimates only.
"""

from typing import Dict, List


# ============================================================================
# RISK SCORING WEIGHTS
# ============================================================================

# Hardcoded weights for risk factors
# Total can exceed 100 - final score is capped at 100
RISK_WEIGHTS = {
    "internal_contradiction": 40,
    "rag_contradiction": 35,
    "rag_unverified": 15,
    "overconfidence": 20,
}

# Domain risk multipliers for trust scoring
DOMAIN_MULTIPLIERS = {
    "general": 1.0,
    "health": 1.5,   # Medical misinformation is dangerous
    "finance": 1.4,  # Financial harm potential
    "legal": 1.6,    # Legal consequences
}

# Time sensitivity impact on trust
TIME_SENSITIVITY_IMPACT = {
    "LOW": 0.0,      # No additional risk
    "MEDIUM": 0.10,  # Slight trust reduction
    "HIGH": 0.20,    # Significant trust reduction
}


def calculate_risk_score(signals: Dict) -> int:
    """
    Aggregate all signals into one numeric risk score (0-100).
    
    Higher score = higher risk (not lower correctness).
    
    Weights (hardcoded):
    - Internal contradiction: +40
    - RAG contradiction: +35
    - RAG unverified claim: +15
    - Overconfidence: +20
    
    Final score is capped at 100.
    
    Args:
        signals: Dict containing boolean signal flags
                 Expected keys: rag_contradiction, rag_unverified,
                               internal_contradiction, overconfidence
                               
    Returns:
        Risk score (0-100)
    """
    score = 0
    
    # Add points for each detected signal
    if signals.get("internal_contradiction", False):
        score += RISK_WEIGHTS["internal_contradiction"]
    
    if signals.get("rag_contradiction", False):
        score += RISK_WEIGHTS["rag_contradiction"]
    
    if signals.get("rag_unverified", False):
        score += RISK_WEIGHTS["rag_unverified"]
    
    if signals.get("overconfidence", False):
        score += RISK_WEIGHTS["overconfidence"]
    
    # Cap at 100
    return min(score, 100)


# ============================================================================
# EXPLANATION GENERATION
# ============================================================================

def generate_explanation(signals: Dict, score: int) -> str:
    """
    Produce human-readable explanation of risk assessment.
    
    Summarizes why the risk score is high, medium, or low.
    This text will be shown to admins in the dashboard.
    
    Args:
        signals: Dict containing signal flags and details
        score: Calculated risk score
        
    Returns:
        Human-readable explanation string
    """
    issues = []
    
    # Collect issues in order of severity
    if signals.get("internal_contradiction", False):
        details = signals.get("contradiction_details", "")
        if details:
            issues.append(f"Internal contradiction detected: {details}")
        else:
            issues.append("Response contains internal contradictions")
    
    if signals.get("rag_contradiction", False):
        issues.append("Response contradicts retrieved knowledge base information")
    
    if signals.get("rag_unverified", False):
        issues.append("Response contains unverified factual claims")
    
    if signals.get("overconfidence", False):
        reason = signals.get("overconfidence_reason", "")
        if reason:
            issues.append(f"Overconfidence detected: {reason}")
        else:
            issues.append("High confidence language without supporting evidence")
    
    # Generate explanation based on score level
    if score >= 70:
        prefix = "HIGH RISK: "
    elif score >= 35:
        prefix = "MEDIUM RISK: "
    else:
        prefix = "LOW RISK: "
    
    if issues:
        explanation = prefix + "; ".join(issues)
    else:
        explanation = prefix + "Response appears factual and well-grounded"
    
    return explanation


# ============================================================================
# DETAILED RISK BREAKDOWN
# ============================================================================

def get_risk_breakdown(signals: Dict, score: int) -> Dict:
    """
    Provide detailed breakdown of risk score composition.
    
    Useful for debugging and transparency.
    
    Args:
        signals: Dict containing signal flags
        score: Calculated risk score
        
    Returns:
        Dict with detailed risk component information
    """
    breakdown = {
        "total_score": score,
        "components": {},
    }
    
    if signals.get("internal_contradiction", False):
        breakdown["components"]["internal_contradiction"] = RISK_WEIGHTS["internal_contradiction"]
    
    if signals.get("rag_contradiction", False):
        breakdown["components"]["rag_contradiction"] = RISK_WEIGHTS["rag_contradiction"]
    
    if signals.get("rag_unverified", False):
        breakdown["components"]["rag_unverified"] = RISK_WEIGHTS["rag_unverified"]
    
    if signals.get("overconfidence", False):
        breakdown["components"]["overconfidence"] = RISK_WEIGHTS["overconfidence"]
    
    # Calculate raw total before capping
    raw_total = sum(breakdown["components"].values())
    breakdown["raw_total"] = raw_total
    breakdown["capped"] = raw_total > 100
    
    return breakdown


# ============================================================================
# RISK LEVEL CLASSIFICATION
# ============================================================================

def get_risk_level(score: int) -> str:
    """
    Convert numeric score to categorical risk level.
    
    Thresholds:
    - 0-34: LOW
    - 35-69: MEDIUM
    - 70-100: HIGH
    
    Note: This is descriptive only. Enforcement decisions
    are made by a separate policy layer.
    
    Args:
        score: Risk score (0-100)
        
    Returns:
        Risk level string (LOW/MEDIUM/HIGH)
    """
    if score >= 70:
        return "HIGH"
    elif score >= 35:
        return "MEDIUM"
    else:
        return "LOW"


# ============================================================================
# TRUST INTELLIGENCE - TRUST SCORE
# ============================================================================

def calculate_trust_score(
    risk_score: int,
    signals: Dict,
    domain: str = "general",
    time_sensitivity: str = "MEDIUM",
    claim_confidences: Dict[str, float] = None
) -> float:
    """
    Calculate trust score (0-1) representing how safe the response is to expose publicly.
    
    Trust score is INVERSE of risk:
    - 1.0 = fully trustworthy, safe to show
    - 0.0 = completely untrustworthy, should not expose
    
    Factors:
    - Base risk score (inverted)
    - Domain multiplier (sensitive domains reduce trust)
    - Time sensitivity (current info is riskier if stale)
    - Average claim confidence
    
    Args:
        risk_score: Risk score (0-100)
        signals: Signal flags dict
        domain: Detected domain (health/finance/legal/general)
        time_sensitivity: Time sensitivity level (LOW/MEDIUM/HIGH)
        claim_confidences: Dict of claim -> confidence scores
        
    Returns:
        Trust score (0.0 - 1.0)
    """
    # Start with inverse of risk score (normalized to 0-1)
    base_trust = 1.0 - (risk_score / 100.0)
    
    # Apply domain multiplier (reduces trust for sensitive domains)
    domain_multiplier = DOMAIN_MULTIPLIERS.get(domain, 1.0)
    trust_after_domain = base_trust / domain_multiplier
    
    # Apply time sensitivity penalty
    time_penalty = TIME_SENSITIVITY_IMPACT.get(time_sensitivity, 0.10)
    trust_after_time = trust_after_domain - time_penalty
    
    # Factor in average claim confidence
    if claim_confidences:
        avg_confidence = sum(claim_confidences.values()) / len(claim_confidences)
        # Blend with claim confidence (60% trust calculation, 40% claim confidence for more spread)
        trust_after_time = (trust_after_time * 0.6) + (avg_confidence * 0.4)

    # Additional penalties based on detailed signals to increase variance
    if signals:
        if signals.get("rag_unverified"):
            trust_after_time -= 0.05
        if signals.get("rag_contradiction"):
            trust_after_time -= 0.15
        if signals.get("internal_contradiction"):
            trust_after_time -= 0.20
        if signals.get("overconfidence"):
            trust_after_time -= 0.10
        # If auto_block was triggered anywhere upstream, force very low trust
        if signals.get("auto_block"):
            trust_after_time = min(trust_after_time, 0.05)

    # Clamp to [0, 1]
    return max(0.0, min(1.0, trust_after_time))


def get_domain_multiplier(domain: str) -> float:
    """
    Get risk multiplier for a specific domain.
    
    Args:
        domain: Domain name
        
    Returns:
        Multiplier value
    """
    return DOMAIN_MULTIPLIERS.get(domain, 1.0)


# ============================================================================
# TRUST INTELLIGENCE - BUSINESS IMPACT
# ============================================================================

def generate_business_impact(
    trust_score: float,
    risk_score: int,
    domain: str,
    time_sensitivity: str,
    signals: Dict
) -> str:
    """
    Generate business impact explanation for decision makers.
    
    Describes potential consequences if response is exposed to end users.
    
    Args:
        trust_score: Trust score (0-1)
        risk_score: Risk score (0-100)
        domain: Detected domain
        time_sensitivity: Time sensitivity level
        signals: Signal flags
        
    Returns:
        Business impact explanation string
    """
    # Determine severity
    if trust_score >= 0.7:
        severity = "Low"
    elif trust_score >= 0.4:
        severity = "Medium"
    else:
        severity = "High"
    
    impacts = []
    
    # Domain-specific impacts
    if domain == "health":
        if trust_score < 0.5:
            impacts.append("potential health misinformation liability")
        else:
            impacts.append("medical information requiring verification")
    elif domain == "finance":
        if trust_score < 0.5:
            impacts.append("financial advice risk and regulatory concerns")
        else:
            impacts.append("financial information requiring disclaimer")
    elif domain == "legal":
        if trust_score < 0.5:
            impacts.append("legal liability and compliance risk")
        else:
            impacts.append("legal information requiring professional review")
    
    # Time sensitivity impact
    if time_sensitivity == "HIGH":
        impacts.append("time-sensitive data that may become stale quickly")
    
    # Signal-specific impacts
    if signals.get("rag_contradiction"):
        impacts.append("contradicts authoritative sources")
    
    if signals.get("internal_contradiction"):
        impacts.append("contains logical inconsistencies")
    
    if signals.get("overconfidence"):
        impacts.append("overconfident language without grounding")
    
    # Reputational impact
    if trust_score < 0.4:
        reputation = "High reputational risk if exposed publicly"
    elif trust_score < 0.7:
        reputation = "Moderate reputational risk; consider review before exposure"
    else:
        reputation = "Low reputational risk; generally safe for public exposure"
    
    # Combine into explanation
    if impacts:
        impact_text = f"{severity} business impact: {', '.join(impacts)}. {reputation}"
    else:
        impact_text = f"{severity} business impact: {reputation}"
    
    return impact_text
