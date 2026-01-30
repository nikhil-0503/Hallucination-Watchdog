"""
Policy Engine for WATCHDOG Safety System.

This module implements the core decision-making logic that converts risk scores
into actionable policies (ALLOW, WARN, BLOCK).

No external dependencies beyond Python stdlib.
Pure functions with no side effects.
"""

import json
import os
from typing import Optional, Dict, Any


def _load_policies() -> dict:
    """
    Load policy thresholds from policies.json.
    
    Returns:
        dict: Mapping of domain -> {"warn": int, "block": int}
    
    Raises:
        FileNotFoundError: If policies.json does not exist
        json.JSONDecodeError: If policies.json is malformed
    """
    policy_path = os.path.join(os.path.dirname(__file__), "policies.json")
    
    with open(policy_path, "r") as f:
        policies = json.load(f)
    
    return policies


def enforce_policy(risk_score: int, signals: Any = None, user_context: Dict = None) -> Dict[str, Any]:
    """
    Enforce policy decision based on risk score and context.
    
    Interface expected by enforcement.py
    
    Args:
        risk_score: Risk score from risk engine (0-100)
        signals: Risk signals object (unused for now)
        user_context: User context including domain
    
    Returns:
        Dict with action and metadata
    """
    domain = user_context.get('domain', 'general') if user_context else 'general'
    action = decide_action(risk_score, domain)
    
    return {
        'action': action,
        'domain': domain,
        'risk_score': risk_score,
        'reason': f'Risk score {risk_score} triggered {action} action for {domain} domain'
    }


def decide_action(risk_score: int, domain: str = "general") -> str:
    """
    Decide the final action based on risk score and domain policy.
    
    Rules:
    - if risk_score >= block_threshold → BLOCK
    - else if risk_score >= warn_threshold → WARN
    - else → ALLOW
    
    Args:
        risk_score: Integer risk score (0-100, where 100 is highest risk)
        domain: Policy domain (e.g., "general", "health", "finance").
                Defaults to "general" if not found.
    
    Returns:
        One of: 'ALLOW', 'WARN', 'BLOCK'
    
    Example:
        >>> decide_action(45, "general")
        'ALLOW'
        >>> decide_action(65, "general")
        'WARN'
        >>> decide_action(85, "general")
        'BLOCK'
    """
    policies = _load_policies()
    
    # Default to "general" if domain not found
    if domain not in policies:
        domain = "general"
    
    thresholds = policies[domain]
    warn_threshold = thresholds.get("warn", 50)
    block_threshold = thresholds.get("block", 80)
    
    # Decision logic (applied in order)
    if risk_score >= block_threshold:
        return "BLOCK"
    elif risk_score >= warn_threshold:
        return "WARN"
    else:
        return "ALLOW"


def build_user_response(raw_llm_answer: str, action: str) -> str:
    """
    Build the user-visible response based on the action decision.
    
    Safety boundary: If action is BLOCK, the raw answer is never shown.
    
    Args:
        raw_llm_answer: The unfiltered answer from the LLM
        action: One of 'ALLOW', 'WARN', 'BLOCK'
    
    Returns:
        The response to show to the user.
        - If BLOCK: A safety message indicating the output cannot be displayed
        - Otherwise: The raw_llm_answer unchanged
    
    Example:
        >>> build_user_response("Some content", "ALLOW")
        'Some content'
        >>> build_user_response("Some content", "BLOCK")
        'The output cannot be displayed.'
    """
    if action == "BLOCK":
        return "The output cannot be displayed."
    
    return raw_llm_answer
