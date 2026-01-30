"""
WATCHDOG Risk Engine - Package Initialization

Exposes the main analyze() function and key utilities.
"""

from .analyzer import (
    analyze,
    analyze_batch,
    get_version,
    get_system_info,
    is_high_risk,
    is_medium_risk,
    is_low_risk,
    has_contradictions,
    has_unverified_claims,
)

__version__ = "1.0.0"
__all__ = [
    "analyze",
    "analyze_batch",
    "get_version",
    "get_system_info",
    "is_high_risk",
    "is_medium_risk",
    "is_low_risk",
    "has_contradictions",
    "has_unverified_claims",
]
