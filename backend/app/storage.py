"""
WATCHDOG In-Memory Storage
Stores all prompt records for retrieval by admin dashboard
"""

from typing import Dict, List, Optional
from datetime import datetime
from threading import Lock

# Thread-safe in-memory storage
_prompt_records: Dict[int, dict] = {}
_record_counter = 0
_storage_lock = Lock()


def save_prompt_record(
    prompt: str,
    gpt_raw_answer: str,
    user_visible_answer: str,
    confidence: float,
    rag_status: str,
    contradiction_check: str,
    action: str,
    risk_score: int,
    explanation: str,
    metadata: dict = None
) -> int:
    """
    Save a prompt record to in-memory storage.
    
    Returns:
        int: The unique ID of the saved record
    """
    global _record_counter
    
    with _storage_lock:
        _record_counter += 1
        record_id = _record_counter
        
        record = {
            "id": record_id,
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "gpt_raw_answer": gpt_raw_answer,
            "user_visible_answer": user_visible_answer,
            "confidence": confidence,
            "rag_status": rag_status,
            "contradiction_check": contradiction_check,
            "action": action,
            "risk_score": risk_score,
            "explanation": explanation,
            "metadata": metadata or {}
        }
        
        _prompt_records[record_id] = record
        return record_id


def get_all_prompts() -> List[dict]:
    """
    Get all prompt records ordered by timestamp (newest first).
    
    Returns:
        List of all prompt records
    """
    with _storage_lock:
        records = list(_prompt_records.values())
        # Sort by timestamp descending (newest first)
        records.sort(key=lambda x: x["timestamp"], reverse=True)
        return records


def get_prompt_by_id(prompt_id: int) -> Optional[dict]:
    """
    Get a single prompt record by ID.
    
    Args:
        prompt_id: The unique ID of the prompt
        
    Returns:
        The prompt record dict, or None if not found
    """
    with _storage_lock:
        return _prompt_records.get(prompt_id)


def clear_all_prompts():
    """
    Clear all stored prompts (for testing purposes).
    """
    global _record_counter
    with _storage_lock:
        _prompt_records.clear()
        _record_counter = 0
