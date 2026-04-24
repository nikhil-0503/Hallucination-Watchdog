"""
WATCHDOG Bias Engine - Demographic Utilities

Provides functions for:
- Detecting protected attributes in decisions (age, gender, race, ethnicity)
- Extracting demographic information from decision records
- Normalizing demographic categories for fairness analysis
"""

from typing import Dict, List, Set, Optional, Tuple
import re


# Protected attributes under law and ethical frameworks
PROTECTED_ATTRIBUTES = {
    "age": ["age", "years", "born", "dob", "age_group", "age_range"],
    "gender": ["gender", "sex", "female", "male", "woman", "man", "she", "he"],
    "race": ["race", "racial", "black", "white", "african", "caucasian", "asian", "hispanic", "latino"],
    "ethnicity": ["ethnicity", "ethnic", "european", "middle_eastern", "south_asian", "east_asian"],
    "religion": ["religion", "religious", "christian", "muslim", "jewish", "hindu", "buddhist"],
    "disability": ["disability", "disabled", "wheelchair", "blind", "deaf", "mental"],
    "national_origin": ["country", "citizenship", "immigrant", "national_origin"],
    "sexual_orientation": ["gay", "lesbian", "bisexual", "transgender", "lgbtq"],
}


def extract_demographics(decision_record: Dict) -> Dict[str, any]:
    """
    Extract demographic information from a decision record.
    
    Scans all text fields in the record for protected attributes
    and attempts to categorize them.
    
    Args:
        decision_record: Dictionary containing decision data
                        Example: {
                            "applicant_name": "John",
                            "age": 35,
                            "gender": "male",
                            "decision": "approved",
                            "reason": "Strong credit history"
                        }
    
    Returns:
        Dictionary of detected demographics:
        {
            "age": {"detected": True, "value": "35"},
            "gender": {"detected": True, "value": "male"},
            "race": {"detected": False},
            ...
        }
    """
    demographics = {}
    record_text = str(decision_record).lower()
    
    for attr_type, keywords in PROTECTED_ATTRIBUTES.items():
        detected = any(keyword in record_text for keyword in keywords)
        demographics[attr_type] = {
            "detected": detected,
            "value": extract_attribute_value(decision_record, attr_type)
        }
    
    return demographics


def extract_attribute_value(record: Dict, attribute_type: str) -> Optional[str]:
    """
    Extract the specific value of a demographic attribute from a record.
    
    Args:
        record: Decision record dictionary
        attribute_type: Type of attribute (age, gender, race, etc.)
    
    Returns:
        The attribute value if found, None otherwise
    """
    keywords = PROTECTED_ATTRIBUTES.get(attribute_type, [])
    record_text = str(record).lower()
    
    # First check if direct field exists
    for key in record.keys():
        if key.lower() in keywords:
            return str(record[key])
    
    # Simple pattern matching for common formats
    for keyword in keywords:
        pattern = rf"{keyword}[:\s=]*([a-z0-9\-]+)"
        match = re.search(pattern, record_text)
        if match:
            return match.group(1)
    
    return None


def group_by_demographic(
    decisions: List[Dict],
    attribute: str
) -> Dict[str, List[Dict]]:
    """
    Group decision records by a specific demographic attribute.
    
    Args:
        decisions: List of decision records
        attribute: Attribute to group by (age, gender, race, etc.)
    
    Returns:
        Dictionary mapping attribute values to lists of decisions
        Example: {
            "male": [decision1, decision2, ...],
            "female": [decision3, decision4, ...],
            "unknown": [decision5, ...]
        }
    """
    grouped = {}
    
    for decision in decisions:
        demographics = extract_demographics(decision)
        value = demographics.get(attribute, {}).get("value", "unknown")
        
        if value not in grouped:
            grouped[value] = []
        grouped[value].append(decision)
    
    return grouped


def calculate_group_statistics(
    group_decisions: Dict[str, List[Dict]],
    outcome_field: str
) -> Dict[str, Dict]:
    """
    Calculate approval rates and other statistics by demographic group.
    
    Args:
        group_decisions: Output from group_by_demographic()
        outcome_field: Field name for decision outcome (e.g., "decision", "approved")
    
    Returns:
        Dictionary with statistics per group:
        {
            "male": {
                "total": 100,
                "approved": 75,
                "approval_rate": 0.75,
                "denied": 25
            },
            "female": {
                "total": 100,
                "approved": 50,
                "approval_rate": 0.50,
                "denied": 50
            }
        }
    """
    stats = {}
    
    for group_name, decisions in group_decisions.items():
        total = len(decisions)
        approved = sum(
            1 for d in decisions
            if d.get(outcome_field, "").lower() in ["approved", "yes", "true", "allow", "1"]
        )
        denied = total - approved
        approval_rate = approved / total if total > 0 else 0.0
        
        stats[group_name] = {
            "total": total,
            "approved": approved,
            "denied": denied,
            "approval_rate": approval_rate
        }
    
    return stats


def detect_significant_disparity(
    stats: Dict[str, Dict],
    threshold: float = 0.10
) -> Tuple[bool, float, str]:
    """
    Detect if there's a significant disparity in approval rates across groups.
    
    Uses the 4/5ths rule commonly used in employment discrimination analysis:
    If approval rate of minority group < 4/5 * approval rate of majority group,
    there may be adverse impact.
    
    Args:
        stats: Output from calculate_group_statistics()
        threshold: Disparity threshold (default: 0.10 = 10% difference)
    
    Returns:
        Tuple: (has_disparity: bool, max_disparity: float, description: str)
    """
    if len(stats) < 2:
        return False, 0.0, "Insufficient groups for disparity analysis"
    
    approval_rates = {k: v["approval_rate"] for k, v in stats.items()}
    max_rate = max(approval_rates.values())
    min_rate = min(approval_rates.values())
    disparity = max_rate - min_rate
    
    # Four-fifths rule: 0.80 threshold
    four_fifths_threshold = max_rate * 0.80
    significant = min_rate < four_fifths_threshold
    
    description = (
        f"Disparity: {disparity:.1%} (min: {min_rate:.1%}, max: {max_rate:.1%}). "
        f"{'SIGNIFICANT' if significant else 'Within acceptable range'}"
    )
    
    return significant, disparity, description
