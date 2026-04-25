"""
WATCHDOG Persistent Storage
Stores all prompt records with JSON file persistence
"""

import json
import os
from typing import Dict, List, Optional
from datetime import datetime
from threading import Lock

# Storage file path
STORAGE_FILE = os.path.join(os.path.dirname(__file__), "..", "prompt_storage.json")
STORAGE_FILE = os.path.abspath(STORAGE_FILE)

# Thread-safe in-memory storage
_prompt_records: Dict[int, dict] = {}
_record_counter = 0
_storage_lock = Lock()


def _load_storage():
    """Load persisted records from disk on module init."""
    global _record_counter, _prompt_records
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                _prompt_records = {int(k): v for k, v in data.get("records", {}).items()}
                _record_counter = data.get("counter", 0)
        except Exception as e:
            print(f"[storage] Could not load persisted storage: {e}")
            _prompt_records = {}
            _record_counter = 0


def _save_storage():
    """Persist records to disk."""
    try:
        with _storage_lock:
            data = {
                "records": _prompt_records,
                "counter": _record_counter,
                "last_saved": datetime.now().isoformat()
            }
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[storage] Could not save storage: {e}")


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
    Save a prompt record to persistent storage.
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

    _save_storage()
    return record_id


def get_all_prompts() -> List[dict]:
    """Get all prompt records ordered by timestamp (newest first)."""
    with _storage_lock:
        records = list(_prompt_records.values())
        records.sort(key=lambda x: x["timestamp"], reverse=True)
        return records


def get_prompt_by_id(prompt_id: int) -> Optional[dict]:
    """Get a single prompt record by ID."""
    with _storage_lock:
        return _prompt_records.get(prompt_id)


def get_stats() -> dict:
    """Compute real-time statistics from all stored prompts."""
    with _storage_lock:
        records = list(_prompt_records.values())
    total = len(records)
    if total == 0:
        return {
            "total": 0,
            "blocked": 0,
            "warned": 0,
            "allowed": 0,
            "avg_confidence": 0,
            "block_rate": 0,
            "warn_rate": 0,
            "allow_rate": 0,
        }
    blocked = sum(1 for r in records if r.get("action") == "BLOCK")
    warned = sum(1 for r in records if r.get("action") == "WARN")
    allowed = sum(1 for r in records if r.get("action") == "ALLOW")
    avg_conf = sum(r.get("confidence", 0) for r in records) / total
    return {
        "total": total,
        "blocked": blocked,
        "warned": warned,
        "allowed": allowed,
        "avg_confidence": round(avg_conf, 3),
        "block_rate": round(blocked / total, 3),
        "warn_rate": round(warned / total, 3),
        "allow_rate": round(allowed / total, 3),
    }


def clear_all_prompts():
    """Clear all stored prompts and persist."""
    global _record_counter
    with _storage_lock:
        _prompt_records.clear()
        _record_counter = 0
    _save_storage()


# Load persisted data on module init
_load_storage()

