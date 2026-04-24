"""
WATCHDOG Bias Engine - Fairness Scoring Module

Implements fairness metrics for bias detection:
- Demographic Parity: Equal approval rates across groups
- Equal Opportunity: Equal true positive rates across groups
- Equalized Odds: Equal FPR and TPR across groups
- Individual Fairness: Similar decisions for similar profiles
- Calibration: Consistent confidence levels across groups

References:
- Moritz Hardt et al., "Equality of Opportunity in Supervised Learning"
- IEEE's Ethically Aligned Design framework
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class FairnessMetrics:
    """Container for fairness analysis results"""
    demographic_parity_gap: float  # Max difference in approval rates
    equal_opportunity_gap: float   # Max difference in true positive rates
    equalized_odds_gap: float      # Max difference in FPR and TPR
    calibration_score: float       # Avg deviation in confidence/accuracy by group
    protected_attributes_found: List[str]
    recommendation: str  # "ALLOW", "WARN", or "BLOCK"
    confidence: float  # How confident is this assessment (0-1)
    explanation: str


@dataclass
class BiasScore:
    """Simplified bias score for enforcement decisions"""
    score: float  # 0-100, higher = more biased
    level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    factors: Dict[str, float]  # Individual factor scores
    explanation: str
    action: str  # "ALLOW", "WARN", "BLOCK"


def calculate_demographic_parity(
    group_stats: Dict[str, Dict]
) -> Tuple[float, str]:
    """
    Calculate demographic parity gap.
    
    Demographic parity requires equal approval rates across groups.
    Gap = max(approval_rate) - min(approval_rate)
    
    Args:
        group_stats: Dict from demographic_utils.calculate_group_statistics()
    
    Returns:
        Tuple: (gap: float between 0-1, interpretation: str)
    """
    if not group_stats or len(group_stats) < 2:
        return 0.0, "Insufficient groups"
    
    approval_rates = [v["approval_rate"] for v in group_stats.values()]
    gap = max(approval_rates) - min(approval_rates)
    
    if gap < 0.05:
        interp = "Excellent parity"
    elif gap < 0.10:
        interp = "Good parity"
    elif gap < 0.20:
        interp = "Concerning disparity"
    else:
        interp = "Severe disparity"
    
    return gap, interp


def calculate_equal_opportunity(
    group_stats: Dict[str, Dict]
) -> Tuple[float, str]:
    """
    Calculate equal opportunity gap (true positive rates).
    
    Equal opportunity requires equal true positive rates (TPR) across groups
    among those with positive outcomes in reality.
    
    For simplified analysis without ground truth:
    Use approved decisions and check consistency in decision patterns.
    
    Args:
        group_stats: Dict from demographic_utils.calculate_group_statistics()
    
    Returns:
        Tuple: (gap: float between 0-1, interpretation: str)
    """
    if not group_stats or len(group_stats) < 2:
        return 0.0, "Insufficient groups"
    
    # For decisions without explicit ground truth, use approval rate as proxy
    approval_rates = [v["approval_rate"] for v in group_stats.values()]
    gap = max(approval_rates) - min(approval_rates)
    
    if gap < 0.05:
        interp = "Equal opportunity maintained"
    elif gap < 0.15:
        interp = "Moderate opportunity gap"
    else:
        interp = "Severe opportunity gap"
    
    return gap, interp


def calculate_equalized_odds_gap(
    group_stats: Dict[str, Dict]
) -> Tuple[float, str]:
    """
    Calculate equalized odds gap (combined FPR and TPR).
    
    Simplified version: checks variance in approval rates.
    
    Args:
        group_stats: Dict from demographic_utils.calculate_group_statistics()
    
    Returns:
        Tuple: (gap: float, interpretation: str)
    """
    approval_rates = [v["approval_rate"] for v in group_stats.values()]
    
    # Calculate coefficient of variation
    if len(approval_rates) < 2:
        return 0.0, "Insufficient groups"
    
    mean_rate = sum(approval_rates) / len(approval_rates)
    variance = sum((r - mean_rate) ** 2 for r in approval_rates) / len(approval_rates)
    cv = (variance ** 0.5) / mean_rate if mean_rate > 0 else 0.0
    
    if cv < 0.10:
        interp = "Good equalized odds"
    elif cv < 0.25:
        interp = "Moderate odds gap"
    else:
        interp = "Severe odds gap"
    
    return cv, interp


def calculate_individual_fairness(
    decision_histories: List[Dict]
) -> Tuple[float, str]:
    """
    Check individual fairness: similar cases receive similar decisions.
    
    This is a simplified check that looks for outlier decisions
    within demographic groups (cases that seem inconsistent).
    
    Args:
        decision_histories: List of historical decisions
    
    Returns:
        Tuple: (score: float 0-1 (1=perfectly fair), interpretation: str)
    """
    if len(decision_histories) < 10:
        return 0.5, "Insufficient historical data"
    
    # Simplified: check if similar profiles have consistent outcomes
    # In production, would use ML similarity metrics
    consistent = 0
    for i, d1 in enumerate(decision_histories[:-1]):
        for d2 in decision_histories[i+1:]:
            # If same demographic attributes, should have same outcome
            if are_profiles_similar(d1, d2):
                if get_outcome(d1) == get_outcome(d2):
                    consistent += 1
    
    total_comparisons = len(decision_histories) * (len(decision_histories) - 1) / 2
    fairness_score = consistent / total_comparisons if total_comparisons > 0 else 0.5
    
    if fairness_score > 0.90:
        interp = "Excellent individual consistency"
    elif fairness_score > 0.80:
        interp = "Good individual consistency"
    elif fairness_score > 0.70:
        interp = "Moderate consistency issues"
    else:
        interp = "Severe consistency issues"
    
    return fairness_score, interp


def calculate_calibration_gap(
    group_stats: Dict[str, Dict]
) -> Tuple[float, str]:
    """
    Check calibration: confidence/accuracy is consistent across groups.
    
    Args:
        group_stats: Dict with approval rates and volumes per group
    
    Returns:
        Tuple: (gap_score: float 0-1, interpretation: str)
    """
    approval_rates = list(group_stats.values())
    if len(approval_rates) < 2:
        return 0.0, "Insufficient groups"
    
    # Calculate avg deviation in approval rates
    rates = [v["approval_rate"] for v in approval_rates]
    avg_rate = sum(rates) / len(rates)
    avg_deviation = sum(abs(r - avg_rate) for r in rates) / len(rates)
    
    # Normalize to 0-1 scale
    gap = min(avg_deviation / 0.5, 1.0)
    
    if gap < 0.05:
        interp = "Well-calibrated"
    elif gap < 0.15:
        interp = "Reasonably calibrated"
    else:
        interp = "Poorly calibrated"
    
    return gap, interp


def calculate_comprehensive_bias_score(
    decision_data: Dict,
    demographics: Dict[str, any] = None
) -> BiasScore:
    """
    Calculate comprehensive bias score combining all fairness metrics.
    
    Args:
        decision_data: {
            "group_stats": Dict from calculate_group_statistics(),
            "decision_histories": List of all decisions,
            "outcome_field": name of outcome field
        }
        demographics: Detected demographics in current decision
    
    Returns:
        BiasScore with overall bias assessment
    """
    group_stats = decision_data.get("group_stats", {})
    histories = decision_data.get("decision_histories", [])
    
    # Calculate individual metrics
    dem_parity, dem_parity_interp = calculate_demographic_parity(group_stats)
    eq_opp, eq_opp_interp = calculate_equal_opportunity(group_stats)
    eq_odds, eq_odds_interp = calculate_equalized_odds_gap(group_stats)
    ind_fair, ind_fair_interp = calculate_individual_fairness(histories)
    calib, calib_interp = calculate_calibration_gap(group_stats)
    
    # Normalize to 0-100 scale (higher = more biased)
    factors = {
        "demographic_parity": dem_parity * 100,
        "equal_opportunity": eq_opp * 100,
        "equalized_odds": eq_odds * 100,
        "calibration": calib * 100,
        "individual_fairness": (1 - ind_fair) * 100,
    }
    
    # Weighted average (equal weights for this simple version)
    overall_bias = sum(factors.values()) / len(factors)
    
    # Determine level and action
    if overall_bias < 10:
        level = "LOW"
        action = "ALLOW"
    elif overall_bias < 25:
        level = "MEDIUM"
        action = "WARN"
    elif overall_bias < 50:
        level = "HIGH"
        action = "WARN"
    else:
        level = "CRITICAL"
        action = "BLOCK"
    
    # Build explanation
    explanation = (
        f"Demographic parity gap: {dem_parity:.1%} ({dem_parity_interp}). "
        f"Equal opportunity gap: {eq_opp:.1%} ({eq_opp_interp}). "
        f"Individual fairness: {ind_fair:.1%} ({ind_fair_interp}). "
        f"Calibration: {calib:.1%} ({calib_interp})."
    )
    
    return BiasScore(
        score=overall_bias,
        level=level,
        factors=factors,
        explanation=explanation,
        action=action
    )


def are_profiles_similar(profile1: Dict, profile2: Dict, threshold: float = 0.8) -> bool:
    """Helper: check if two decision profiles are similar"""
    # Simplified: check if key demographic fields match
    similar_fields = 0
    checked_fields = 0
    
    for key in ["age", "gender", "race", "role", "location"]:
        if key in profile1 and key in profile2:
            checked_fields += 1
            if str(profile1[key]).lower() == str(profile2[key]).lower():
                similar_fields += 1
    
    if checked_fields == 0:
        return False
    
    return (similar_fields / checked_fields) >= threshold


def get_outcome(decision: Dict) -> Optional[str]:
    """Helper: extract decision outcome (approved/denied)"""
    for field in ["decision", "outcome", "result", "approved", "action"]:
        if field in decision:
            return str(decision[field]).lower()
    return None
