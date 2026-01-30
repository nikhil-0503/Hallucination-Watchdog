"""
Audit logger for WATCHDOG safety system.

Writes immutable audit records in JSONL format (one JSON object per line).
File is created if it does not exist. Designed for append-only durability.
"""

import json
import os
from typing import Optional, Dict, Any
from datetime import datetime

from audit.schemas import AuditEvent


def log_decision(decision_data: Dict[str, Any]) -> None:
    """
    Log an enforcement decision to the audit log.
    
    Interface expected by enforcement.py
    
    Args:
        decision_data: Dictionary containing decision metadata
    """
    try:
        # Create audit event
        event = AuditEvent(
            timestamp=datetime.now().isoformat(),
            prompt=decision_data.get('prompt', 'Unknown'),
            gpt_raw_answer=decision_data.get('gpt_response', 'Unknown'),
            user_visible_answer=decision_data.get('final_response', 'Unknown'),
            risk_score=decision_data.get('risk_score', 0),
            rag_status=decision_data.get('rag_status', 'unknown'),
            contradiction_check=decision_data.get('contradiction_check', 'unknown'),
            final_action=decision_data.get('action', 'UNKNOWN'),
            explanation=decision_data.get('explanation', 'No explanation provided')
        )
        
        log_event(event)
    except Exception as e:
        # Don't fail the request if audit logging fails
        print(f"Audit logging failed: {e}")


def log_event(event: AuditEvent, path: str = "audit_log.jsonl") -> None:
    """
    Append one audit event as a JSON line to the audit log file.
    
    Creates the file if it does not exist.
    Each call appends exactly one JSON object, followed by a newline.
    
    Args:
        event: AuditEvent dataclass instance to log
        path: Path to the audit log file (defaults to audit_log.jsonl
              in current working directory)
    
    Returns:
        None
    
    Raises:
        IOError: If the file cannot be written
        TypeError: If the event is not serializable to JSON
    
    Example:
        >>> from datetime import datetime
        >>> event = AuditEvent(
        ...     timestamp="2026-01-30T10:00:00Z",
        ...     prompt="What is AI?",
        ...     gpt_raw_answer="AI is...",
        ...     user_visible_answer="AI is...",
        ...     risk_score=25,
        ...     rag_status="yes",
        ...     contradiction_check="pass",
        ...     final_action="ALLOW",
        ...     explanation="Low risk general knowledge query"
        ... )
        >>> log_event(event, "/tmp/test.jsonl")
    """
    # Convert event to dictionary (handles dataclass conversion)
    event_dict = event.to_dict()
    
    # Serialize to JSON
    json_line = json.dumps(event_dict, ensure_ascii=False)
    
    # Append to file (create if doesn't exist)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json_line + "\n")


def read_audit_log(path: str = "audit_log.jsonl") -> list[AuditEvent]:
    """
    Read all events from the audit log file.
    
    Useful for analysis, verification, and replay scenarios.
    
    Args:
        path: Path to the audit log file
    
    Returns:
        List of AuditEvent objects, in chronological order
    
    Raises:
        FileNotFoundError: If the log file does not exist
        json.JSONDecodeError: If a line in the file is not valid JSON
    
    Example:
        >>> events = read_audit_log("audit_log.jsonl")
        >>> for event in events:
        ...     print(event.final_action, event.risk_score)
    """
    events = []
    
    if not os.path.exists(path):
        return events
    
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            event_dict = json.loads(line)
            event = AuditEvent(**event_dict)
            events.append(event)
    
    return events
