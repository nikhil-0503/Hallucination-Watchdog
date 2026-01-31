"""
WATCHDOG Risk Engine - Signal Detection Module

This module detects hallucination signals from LLM responses:
- Claim extraction
- Overconfidence detection
- Internal contradiction detection
- RAG verification

Does NOT make enforcement decisions - only detects risk signals.
"""

import re
from typing import List, Dict, Optional, Tuple


# ============================================================================
# CLAIM EXTRACTION
# ============================================================================

def extract_claims(llm_response: str) -> List[str]:
    """
    Break LLM response into atomic factual claims.
    
    Uses simple sentence splitting - no heavy NLP required.
    Deterministic and production-ready.
    
    Args:
        llm_response: Raw text from the LLM
        
    Returns:
        List of atomic claim strings
    """
    if not llm_response or not llm_response.strip():
        return []
    
    # Split by sentence-ending punctuation
    sentences = re.split(r'[.!?]+', llm_response)
    
    # Clean and filter
    claims = []
    for sentence in sentences:
        cleaned = sentence.strip()
        # Filter out very short fragments or questions
        if len(cleaned) > 10 and not cleaned.endswith('?'):
            claims.append(cleaned)
    
    return claims


# ============================================================================
# OVERCONFIDENCE DETECTION
# ============================================================================

# High-confidence language patterns
OVERCONFIDENCE_PATTERNS = [
    r'\bdefinitely\b',
    r'\bguaranteed?\b',
    r'\bcertainly\b',
    r'\babsolutely\b',
    r'\bwithout (a )?doubt\b',
    r'\b100%\b',
    r'\balways\b',
    r'\bnever\b',
    r'\bimpossible\b',
    r'\bprovided?\b',
    r'\bmust be\b',
    r'\bwill definitely\b',
    r'\bno question\b',
]

# Sensitive domains where confidence is risky
SENSITIVE_DOMAINS = [
    r'\bmedical\b', r'\bhealth\b', r'\bdisease\b', r'\bdiagnos\w+\b',
    r'\blegal\b', r'\blaw\b', r'\bcourt\b', r'\brights?\b',
    r'\bfinancial\b', r'\binvest\w+\b', r'\bstock\b', r'\bmoney\b',
    r'\bsafety\b', r'\bemergency\b',
]


def detect_overconfidence(llm_response: str, prompt: str = "") -> Tuple[bool, str]:
    """
    Detect overconfident language or high-confidence claims in sensitive domains.
    
    Flags responses that:
    - Use absolute certainty language
    - Make confident claims in medical/legal/financial domains
    - Provide specific numbers/dates without grounding
    
    Args:
        llm_response: Raw text from the LLM
        prompt: Original user question (helps detect sensitive domains)
        
    Returns:
        Tuple of (is_overconfident, reason)
    """
    combined_text = (prompt + " " + llm_response).lower()
    
    # Check for high-confidence language
    for pattern in OVERCONFIDENCE_PATTERNS:
        if re.search(pattern, llm_response, re.IGNORECASE):
            return True, "High confidence language detected"
    
    # Check for confident claims in sensitive domains
    in_sensitive_domain = any(
        re.search(pattern, combined_text, re.IGNORECASE) 
        for pattern in SENSITIVE_DOMAINS
    )
    
    if in_sensitive_domain:
        # Look for specific numbers, dates, or definitive statements
        has_specific_claims = bool(
            re.search(r'\b\d{4}\b', llm_response) or  # Years
            re.search(r'\b\d+(\.\d+)?%\b', llm_response) or  # Percentages
            re.search(r'\$\d+', llm_response) or  # Money
            re.search(r'\b(should|must|need to)\b', llm_response, re.IGNORECASE)
        )
        
        if has_specific_claims:
            return True, "Confident advice in sensitive domain"
    
    return False, ""


# ============================================================================
# INTERNAL CONTRADICTION DETECTION
# ============================================================================

def detect_internal_contradictions(llm_response: str) -> Tuple[bool, str]:
    """
    Detect logical contradictions within the same response.
    
    Looks for:
    - Timeline conflicts (e.g., "started in 2020" vs "active since 2018")
    - Direct contradictions (e.g., "is open" vs "has closed")
    - Inconsistent numbers or facts
    
    Args:
        llm_response: Raw text from the LLM
        
    Returns:
        Tuple of (has_contradiction, details)
    """
    # Extract all years mentioned
    years = re.findall(r'\b(19|20)\d{2}\b', llm_response)
    
    # Look for timeline conflicts
    if len(years) >= 2:
        year_ints = [int(y) for y in years]
        min_year = min(year_ints)
        max_year = max(year_ints)
        
        # CRITICAL FIX: Check for "introduced" AFTER "active since" contradiction
        # Example: "introduced in 2022" but "active since 2019" is contradictory
        text_lower = llm_response.lower()
        
        # Pattern 1: Something introduced/started later than it was active
        introduced_match = re.search(r'\b(introduced|started|began|launched)\b.*?(\d{4})', text_lower)
        active_match = re.search(r'\b(since|active.*?since|been.*?since)\b.*?(\d{4})', text_lower)
        
        if introduced_match and active_match:
            introduced_year = int(introduced_match.group(2))
            active_year = int(active_match.group(2))
            
            # If something was "introduced" AFTER it was "active since", that's a contradiction
            if introduced_year > active_year:
                return True, f"Timeline conflict: introduced in {introduced_year} but active since {active_year}"
        
        # Pattern 2: Large unexplained gaps (10+ years)
        if max_year - min_year > 10:
            if re.search(r'\b(started|began|introduced|launched)\b', llm_response, re.IGNORECASE):
                if re.search(r'\b(since|active|running|operating)\b', llm_response, re.IGNORECASE):
                    return True, "Timeline inconsistency: large time gap detected"
    
    # Check for contradictory statements about status
    text_lower = llm_response.lower()
    
    # Open/closed contradiction
    if 'open' in text_lower and 'closed' in text_lower:
        if 'currently open' in text_lower and 'has closed' in text_lower:
            return True, "Contradictory status statements"
    
    # Yes/no contradiction
    if 'yes' in text_lower and 'no' in text_lower:
        # Simple heuristic: if both appear near decisions/answers
        if re.search(r'\b(yes|no)\b.*\b(no|yes)\b', text_lower):
            return True, "Contradictory yes/no statements"
    
    # Numerical contradictions
    numbers = re.findall(r'\b\d+\b', llm_response)
    if len(numbers) >= 2:
        # Check if same entity has different numbers
        sentences = llm_response.split('.')
        for i, sent in enumerate(sentences):
            sent_numbers = re.findall(r'\b\d+\b', sent)
            if len(sent_numbers) >= 2:
                # Same sentence with very different numbers might be contradictory
                nums = [int(n) for n in sent_numbers if n.isdigit()]
                if len(nums) >= 2 and max(nums) > 0:
                    if max(nums) / min(nums) > 10:  # Order of magnitude difference
                        return True, "Conflicting numerical values"
    
    return False, ""


# ============================================================================
# RAG VERIFICATION
# ============================================================================

def verify_against_rag(
    claims: List[str], 
    rag_results: Optional[List[Dict]] = None
) -> Dict[str, str]:
    """
    Compare extracted claims against RAG retrieved data.
    
    For each claim, determine:
    - SUPPORTED: Found matching information in RAG
    - CONTRADICTED: RAG contains conflicting information
    - UNVERIFIED: No matching information found (NOT the same as false!)
    
    Args:
        claims: List of atomic claim strings
        rag_results: Optional list of RAG documents/chunks
                     Expected format: [{"content": "...", "metadata": {...}}, ...]
        
    Returns:
        Dict mapping claim text to status (SUPPORTED/CONTRADICTED/UNVERIFIED)
    """
    verification = {}
    
    # If no RAG data, all claims are UNVERIFIED
    if not rag_results:
        for claim in claims:
            verification[claim] = "UNVERIFIED"
        return verification
    
    # Combine all RAG content for comparison
    rag_text = " ".join(
        doc.get("content", "") 
        for doc in rag_results 
        if isinstance(doc, dict)
    ).lower()
    
    for claim in claims:
        claim_lower = claim.lower()
        
        # Extract key terms from claim (simple keyword matching)
        claim_words = set(re.findall(r'\b\w+\b', claim_lower))
        claim_words = {w for w in claim_words if len(w) > 3}  # Filter short words
        
        if not claim_words:
            verification[claim] = "UNVERIFIED"
            continue
        
        # Check for presence in RAG
        matching_words = sum(1 for word in claim_words if word in rag_text)
        coverage = matching_words / len(claim_words) if claim_words else 0
        
        if coverage >= 0.5:  # At least 50% of key terms found
            # Check for contradiction indicators
            contradiction_patterns = [
                r'\bnot\b', r'\bno\b', r'\bnever\b', r'\bfalse\b',
                r'\bincorrect\b', r'\bwrong\b'
            ]
            
            # Look for claim terms near contradiction words
            has_contradiction = False
            for word in claim_words:
                if word in rag_text:
                    # Get context around the word
                    word_pos = rag_text.find(word)
                    context = rag_text[max(0, word_pos-50):word_pos+50]
                    
                    for pattern in contradiction_patterns:
                        if re.search(pattern, context):
                            has_contradiction = True
                            break
                if has_contradiction:
                    break
            
            if has_contradiction:
                verification[claim] = "CONTRADICTED"
            else:
                verification[claim] = "SUPPORTED"
        else:
            verification[claim] = "UNVERIFIED"
    
    return verification


# ============================================================================
# TRUST INTELLIGENCE - CLAIM CONFIDENCE
# ============================================================================

def calculate_claim_confidence(claim: str, rag_status: str, llm_response: str) -> float:
    """
    Calculate confidence score (0-1) for an individual claim.
    
    Factors considered:
    - RAG verification status
    - Presence of hedging language
    - Specificity of claim
    - Length and complexity
    
    Args:
        claim: The claim text
        rag_status: SUPPORTED/CONTRADICTED/UNVERIFIED
        llm_response: Full response for context
        
    Returns:
        Confidence score (0.0 - 1.0)
    """
    confidence = 0.5  # Base confidence
    
    # Factor 1: RAG verification (most important)
    if rag_status == "SUPPORTED":
        confidence += 0.35
    elif rag_status == "CONTRADICTED":
        confidence -= 0.40
    elif rag_status == "UNVERIFIED":
        confidence -= 0.10
    
    # Factor 2: Hedging language (reduces confidence)
    hedging_patterns = [
        r'\bmay\b', r'\bmight\b', r'\bcould\b', r'\bpossibly\b',
        r'\bperhaps\b', r'\bprobably\b', r'\blikely\b', r'\bseems?\b',
        r'\bappears?\b', r'\bsuggests?\b', r'\bindicates?\b',
        r'\bI think\b', r'\bI believe\b'
    ]
    
    hedging_count = sum(
        1 for pattern in hedging_patterns 
        if re.search(pattern, claim, re.IGNORECASE)
    )
    
    if hedging_count > 0:
        confidence -= min(0.15, hedging_count * 0.05)  # Cap reduction
    
    # Factor 3: Specificity (specific numbers/dates increase confidence)
    has_specifics = bool(
        re.search(r'\b\d{4}\b', claim) or  # Years
        re.search(r'\b\d+(\.\d+)?%\b', claim) or  # Percentages
        re.search(r'\b\d+\s*(meters?|km|miles?|feet)\b', claim, re.IGNORECASE)  # Measurements
    )
    
    if has_specifics:
        # Specifics are good IF supported, bad if unverified
        if rag_status == "SUPPORTED":
            confidence += 0.10
        elif rag_status == "UNVERIFIED":
            confidence -= 0.05
    
    # Factor 4: Claim length (very short claims often lack context)
    if len(claim) < 20:
        confidence -= 0.05
    
    # Clamp to [0, 1]
    return max(0.0, min(1.0, confidence))


def detect_claim_dependencies(claims: List[str]) -> Dict[str, List[str]]:
    """
    Detect if claims depend on other claims.
    
    Simple heuristic: check if claims reference entities mentioned in other claims.
    
    Args:
        claims: List of claim texts
        
    Returns:
        Dict mapping claim index to list of dependent claim indices
    """
    dependencies = {}
    
    for i, claim in enumerate(claims):
        dependent_on = []
        
        # Extract potential entities (capitalized words, 2+ letters)
        claim_entities = set(re.findall(r'\b[A-Z][a-z]{1,}\b', claim))
        
        for j, other_claim in enumerate(claims):
            if i != j:
                # Check if current claim references entities from other claim
                other_entities = set(re.findall(r'\b[A-Z][a-z]{1,}\b', other_claim))
                
                # If significant overlap, mark as dependent
                if claim_entities and other_entities:
                    overlap = claim_entities.intersection(other_entities)
                    if len(overlap) >= 1:
                        dependent_on.append(j)
        
        dependencies[str(i)] = dependent_on
    
    return dependencies


# ============================================================================
# TRUST INTELLIGENCE - TIME SENSITIVITY
# ============================================================================

# Time-sensitive language patterns
TIME_SENSITIVE_HIGH = [
    r'\bcurrently\b', r'\bright now\b', r'\btoday\b', r'\bthis (week|month|year)\b',
    r'\brecently\b', r'\blast (week|month|year)\b', r'\bjust (announced|released|happened)\b',
    r'\bas of (now|today|\d{4})\b', r'\bin (20\d{2}|19\d{2})\b',
    r'\blatest\b', r'\bup to date\b', r'\breal[- ]time\b',
]

TIME_SENSITIVE_MEDIUM = [
    r'\bthis (decade|century)\b', r'\bsince (20|19)\d{2}\b',
    r'\bover the (past|last) \w+\b', r'\bin recent (years|times)\b',
    r'\bmodern\b', r'\bcontemporary\b', r'\bpresent day\b',
]

TIME_SENSITIVE_LOW = [
    r'\bhistorically\b', r'\btraditionally\b', r'\balways\b', r'\bnever\b',
    r'\bpermanent\b', r'\btimeless\b', r'\bfundamental\b',
]


def detect_time_sensitivity(prompt: str, llm_response: str) -> str:
    """
    Detect time sensitivity level of the response.
    
    Time-sensitive information becomes stale quickly and increases risk
    if outdated data is served.
    
    Levels:
    - HIGH: Current events, recent data, "currently", "as of 2026"
    - MEDIUM: Recent years, evolving topics
    - LOW: Historical facts, timeless knowledge
    
    Args:
        prompt: User's question
        llm_response: LLM response
        
    Returns:
        "HIGH" | "MEDIUM" | "LOW"
    """
    combined_text = (prompt + " " + llm_response).lower()
    
    # Check for high time sensitivity
    for pattern in TIME_SENSITIVE_HIGH:
        if re.search(pattern, combined_text, re.IGNORECASE):
            return "HIGH"
    
    # Check for medium time sensitivity
    for pattern in TIME_SENSITIVE_MEDIUM:
        if re.search(pattern, combined_text, re.IGNORECASE):
            return "MEDIUM"
    
    # Check for explicitly low time sensitivity
    for pattern in TIME_SENSITIVE_LOW:
        if re.search(pattern, combined_text, re.IGNORECASE):
            return "LOW"
    
    # Default: MEDIUM (better to be cautious)
    return "MEDIUM"


# ============================================================================
# TRUST INTELLIGENCE - DOMAIN DETECTION
# ============================================================================

# Domain detection patterns
DOMAIN_PATTERNS = {
    "health": [
        r'\bmedical\b', r'\bhealth\b', r'\bdisease\b', r'\bdiagnos\w+\b',
        r'\bsymptom\b', r'\btreatment\b', r'\bmedicine\b', r'\bdrug\b',
        r'\bdoctor\b', r'\bpatient\b', r'\bhospital\b', r'\btherapy\b',
        r'\bdiabetes\b', r'\binsulin\b', r'\bcure\b', r'\bheadache\b',
        r'\billness\b', r'\bprescription\b', r'\bdose\b', r'\bpain\b',
    ],
    "finance": [
        r'\bfinancial\b', r'\binvest\w+\b', r'\bstock\b', r'\bmoney\b',
        r'\bbank\w*\b', r'\bloan\b', r'\bcredit\b', r'\bdebt\b',
        r'\bportfolio\b', r'\breturn\b', r'\bprofit\b', r'\bmarket\b',
        r'\bprice\b', r'\btrading\b',
    ],
    "legal": [
        r'\blegal\b', r'\blaw\b', r'\bcourt\b', r'\brights?\b',
        r'\bcontract\b', r'\bliable\b', r'\bliability\b', r'\bsue\b',
        r'\battorney\b', r'\blawyer\b', r'\bregulation\b', r'\bcompliance\b',
        r'\blawsuit\b', r'\bemployer\b', r'\bemployee\b',
    ],
}


def detect_domain(prompt: str, llm_response: str) -> str:
    """
    Detect the domain/category of the query and response.
    
    Different domains have different risk profiles:
    - health: 1.5x multiplier (medical misinformation is dangerous)
    - finance: 1.4x multiplier (financial harm)
    - legal: 1.6x multiplier (legal consequences)
    - general: 1.0x multiplier (baseline)
    
    Args:
        prompt: User's question
        llm_response: LLM response
        
    Returns:
        "health" | "finance" | "legal" | "general"
    """
    combined_text = (prompt + " " + llm_response).lower()
    
    # Count matches for each domain
    domain_scores = {}
    for domain, patterns in DOMAIN_PATTERNS.items():
        score = sum(
            1 for pattern in patterns 
            if re.search(pattern, combined_text, re.IGNORECASE)
        )
        domain_scores[domain] = score
    
    # Return domain with highest score, or "general" if no clear match
    if not domain_scores or max(domain_scores.values()) == 0:
        return "general"
    
    return max(domain_scores.items(), key=lambda x: x[1])[0]


# ============================================================================
# AGGREGATE SIGNAL EXTRACTION
# ============================================================================

def extract_all_signals(
    prompt: str,
    llm_response: str,
    rag_results: Optional[List[Dict]] = None
) -> Dict:
    """
    Main signal extraction function.
    
    Orchestrates all detection modules and returns structured signal data.
    Includes TRUST INTELLIGENCE features.
    
    Args:
        prompt: User's original question
        llm_response: Raw text from the LLM
        rag_results: Optional RAG documents
        
    Returns:
        Dict containing all detected signals, claim analysis, and trust intelligence
    """
    # Extract claims
    claims = extract_claims(llm_response)
    
    # Verify against RAG
    claim_verification = verify_against_rag(claims, rag_results)
    
    # TRUST INTELLIGENCE: Calculate claim-level confidence
    claim_confidences = {}
    for claim in claims:
        rag_status = claim_verification.get(claim, "UNVERIFIED")
        confidence = calculate_claim_confidence(claim, rag_status, llm_response)
        claim_confidences[claim] = confidence
    
    # TRUST INTELLIGENCE: Detect claim dependencies
    claim_dependencies = detect_claim_dependencies(claims)
    
    # TRUST INTELLIGENCE: Detect time sensitivity
    time_sensitivity = detect_time_sensitivity(prompt, llm_response)
    
    # TRUST INTELLIGENCE: Detect domain
    domain = detect_domain(prompt, llm_response)
    
    # Detect overconfidence
    is_overconfident, overconfidence_reason = detect_overconfidence(llm_response, prompt)
    
    # Detect internal contradictions
    has_contradiction, contradiction_details = detect_internal_contradictions(llm_response)
    
    # Aggregate RAG signals
    rag_contradiction = any(
        status == "CONTRADICTED" 
        for status in claim_verification.values()
    )
    rag_unverified = any(
        status == "UNVERIFIED" 
        for status in claim_verification.values()
    )
    
    return {
        # Original signals
        "claims": claims,
        "claim_verification": claim_verification,
        "rag_contradiction": rag_contradiction,
        "rag_unverified": rag_unverified,
        "internal_contradiction": has_contradiction,
        "contradiction_details": contradiction_details,
        "overconfidence": is_overconfident,
        "overconfidence_reason": overconfidence_reason,
        
        # TRUST INTELLIGENCE (new)
        "claim_confidences": claim_confidences,
        "claim_dependencies": claim_dependencies,
        "time_sensitivity": time_sensitivity,
        "domain": domain,
    }
