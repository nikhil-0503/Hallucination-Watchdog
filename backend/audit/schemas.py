"""
Audit event schemas for WATCHDOG safety logging.

Defines the structure of all events logged to audit_log.jsonl.
Extended with enterprise-grade risk analysis fields.
"""

from dataclasses import dataclass, asdict, field
from typing import Optional, List, Dict, Any


@dataclass
class AuditEvent:
    """
    Complete audit record for one request through the WATCHDOG system.
    
    Fields are designed to provide full observability:
    - Input context (prompt, timestamp)
    - LLM output (raw answer)
    - Risk analysis (score, RAG status, contradiction check, explanation)
    - Safety decision (final_action, user-visible response)
    - Advanced risk metrics (freshness, claim breakdown, safety mode)
    
    All timestamps are ISO 8601 format.
    """
    
    timestamp: str
    """ISO 8601 timestamp when the request was processed"""
    
    prompt: str
    """The user's input prompt"""
    
    gpt_raw_answer: str
    """The unfiltered answer from the LLM"""
    
    user_visible_answer: str
    """The response actually shown to the user (may differ if BLOCK)"""
    
    risk_score: int
    """Risk score (0-100) computed by the risk analyzer"""
    
    rag_status: str
    """RAG retrieval status: 'yes', 'no', or 'partial'"""
    
    contradiction_check: str
    """Contradiction check result: 'pass' or 'fail'"""
    
    final_action: str
    """Final safety decision: 'ALLOW', 'WARN', or 'BLOCK'"""
    
    explanation: str
    """Human-readable explanation of the risk assessment"""
    
    domain: Optional[str] = "general"
    """Policy domain used for the decision (defaults to 'general')"""
    
    # Enterprise-grade extensions
    freshness_risk: bool = False
    """Whether time-sensitive claims lack fresh verification"""
    
    claim_risk_breakdown: List[Dict[str, Any]] = field(default_factory=list)
    """Per-claim risk contribution: [{"text": "...", "risk_added": 40, "reasons": [...]}]"""
    
    safety_mode: str = "balanced"
    """Active safety mode: 'conservative', 'balanced', or 'permissive'"""
    
    trust_score: Optional[float] = None
    """Trust/confidence score (0.0-1.0). None if not computed."""
    
    adaptive_weights_applied: bool = False
    """Whether adaptive learning weights were used in this computation"""
    
    def to_dict(self) -> dict:
        """
        Convert audit event to dictionary for JSON serialization.
        
        Returns:
            Dictionary representation of the event
        """
        return asdict(self)
