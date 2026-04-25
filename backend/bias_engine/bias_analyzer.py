"""
WATCHDOG Bias Engine - Main Bias Analyzer

This module provides the main bias analysis pipeline:
1. Extract decision data and demographics
2. Calculate fairness metrics
3. Use Google Gemini API for intelligent bias analysis
4. Generate explanations and recommendations

Requires: GOOGLE_GENERATIVEAI_API_KEY environment variable
"""

import os
from typing import Dict, List, Optional
import logging
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("google-generativeai not installed. Install with: pip install google-generativeai")

from .demographic_utils import (
    extract_demographics,
    group_by_demographic,
    calculate_group_statistics,
    detect_significant_disparity
)
from .bias_scorer import (
    calculate_comprehensive_bias_score,
    calculate_demographic_parity,
    calculate_equal_opportunity,
    BiasScore
)

logger = logging.getLogger(__name__)


class BiasAnalyzer:
    """Main bias analysis engine with Gemini integration"""
    DEFAULT_GEMINI_MODEL = "gemini-1.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize bias analyzer.
        
        Args:
            api_key: Google Generative AI API key. If None, uses GOOGLE_GENERATIVEAI_API_KEY env var
        """
        if not GEMINI_AVAILABLE:
            self.gemini_available = False
            logger.warning("Gemini API not available")
            return
        
        api_key = api_key or os.getenv("GOOGLE_GENERATIVEAI_API_KEY")
        if not api_key:
            self.gemini_available = False
            logger.warning("GOOGLE_GENERATIVEAI_API_KEY not set. Bias analysis will use statistical methods only.")
            return
        
        try:
            genai.configure(api_key=api_key)
            self.model_name = os.getenv("GEMINI_MODEL", self.DEFAULT_GEMINI_MODEL)
            self.model = genai.GenerativeModel(self.model_name)
            self.gemini_available = True
            logger.info(f"Gemini API initialized successfully (model={self.model_name})")
        except Exception as e:
            self.gemini_available = False
            logger.error(f"Failed to initialize Gemini API: {e}")
    
    def analyze_decision(
        self,
        decision: Dict,
        historical_decisions: Optional[List[Dict]] = None,
        outcome_field: str = "decision"
    ) -> Dict:
        """
        Analyze a single decision for bias.
        
        Args:
            decision: Single decision record to analyze
                     Example: {
                         "applicant_name": "John Smith",
                         "age": 35,
                         "gender": "male",
                         "race": "black",
                         "credit_score": 750,
                         "decision": "approved",
                         "reason": "Strong credit history"
                     }
            historical_decisions: List of historical decisions for comparison
            outcome_field: Name of field containing decision outcome
        
        Returns:
            Analysis result dictionary:
            {
                "demographics": {...},
                "bias_score": BiasScore object,
                "fairness_metrics": {...},
                "gemini_analysis": {...},  # If Gemini available
                "recommendation": "ALLOW|WARN|BLOCK",
                "explanation": str,
                "timestamp": str
            }
        """
        # Extract demographics
        demographics = extract_demographics(decision)
        
        # Calculate bias score
        decision_data = {}
        if historical_decisions:
            grouped = group_by_demographic(historical_decisions, "gender")  # or other attributes
            group_stats = calculate_group_statistics(grouped, outcome_field)
            decision_data["group_stats"] = group_stats
            decision_data["decision_histories"] = historical_decisions
        
        bias_score = calculate_comprehensive_bias_score(decision_data, demographics)
        
        # Get Gemini analysis if available
        gemini_analysis = None
        if self.gemini_available and historical_decisions:
            try:
                gemini_analysis = self._get_gemini_bias_analysis(
                    decision, demographics, bias_score, historical_decisions
                )
            except Exception as e:
                logger.error(f"Gemini analysis failed: {e}")
        
        return {
            "decision_id": decision.get("id", "unknown"),
            "timestamp": datetime.now().isoformat(),
            "demographics": demographics,
            "bias_score": {
                "score": bias_score.score,
                "level": bias_score.level,
                "factors": bias_score.factors,
                "explanation": bias_score.explanation,
                "action": bias_score.action
            },
            "gemini_analysis": gemini_analysis,
            "recommendation": bias_score.action,
            "confidence": 0.8  # Confidence in this assessment
        }
    
    def audit_dataset(
        self,
        decisions: List[Dict],
        outcome_field: str = "decision"
    ) -> Dict:
        """
        Perform comprehensive bias audit on a dataset.
        
        Args:
            decisions: List of decision records to audit
            outcome_field: Field name for decision outcomes
        
        Returns:
            Audit report:
            {
                "dataset_size": int,
                "fairness_metrics": {...},
                "risky_decisions": [...],
                "demographic_analysis": {...},
                "gemini_report": str,  # If Gemini available
                "overall_recommendation": "ALLOW|WARN|BLOCK",
                "timestamp": str
            }
        """
        if not decisions:
            return {
                "error": "No decisions provided",
                "dataset_size": 0
            }
        
        logger.info(f"Auditing dataset with {len(decisions)} decisions")
        
        # Analyze by gender
        by_gender = group_by_demographic(decisions, "gender")
        gender_stats = calculate_group_statistics(by_gender, outcome_field)
        gender_disparity, gender_gap, gender_desc = detect_significant_disparity(gender_stats)
        
        # Analyze by age
        by_age = group_by_demographic(decisions, "age")
        age_stats = calculate_group_statistics(by_age, outcome_field)
        age_disparity, age_gap, age_desc = detect_significant_disparity(age_stats)
        
        # Analyze by race
        by_race = group_by_demographic(decisions, "race")
        race_stats = calculate_group_statistics(by_race, outcome_field)
        race_disparity, race_gap, race_desc = detect_significant_disparity(race_stats)
        
        # Identify risky decisions (outliers or extreme disparities)
        risky_decisions = self._identify_risky_decisions(decisions, outcome_field)
        
        # Generate Gemini report if available
        gemini_report = None
        if self.gemini_available:
            try:
                gemini_report = self._get_dataset_audit_report(
                    decisions, gender_stats, age_stats, race_stats
                )
            except Exception as e:
                logger.error(f"Gemini report generation failed: {e}")
        
        # Determine overall recommendation
        has_critical_disparity = any([
            gender_disparity,
            age_disparity,
            race_disparity
        ])
        
        overall_recommendation = (
            "BLOCK" if has_critical_disparity and len(decisions) > 50
            else "WARN" if has_critical_disparity
            else "ALLOW"
        )
        
        return {
            "dataset_size": len(decisions),
            "audit_timestamp": datetime.now().isoformat(),
            "fairness_metrics": {
                "gender": {
                    "stats": gender_stats,
                    "disparity_detected": gender_disparity,
                    "disparity_gap": gender_gap,
                    "description": gender_desc
                },
                "age": {
                    "stats": age_stats,
                    "disparity_detected": age_disparity,
                    "disparity_gap": age_gap,
                    "description": age_desc
                },
                "race": {
                    "stats": race_stats,
                    "disparity_detected": race_disparity,
                    "disparity_gap": race_gap,
                    "description": race_desc
                }
            },
            "risky_decisions": risky_decisions,
            "gemini_audit_report": gemini_report,
            "overall_recommendation": overall_recommendation,
            "summary": self._generate_audit_summary(
                gender_disparity, age_disparity, race_disparity,
                len(risky_decisions), len(decisions)
            )
        }
    
    def _get_gemini_bias_analysis(
        self,
        decision: Dict,
        demographics: Dict,
        bias_score: BiasScore,
        historical_data: List[Dict]
    ) -> Dict:
        """Use Gemini to analyze bias in a specific decision"""
        
        prompt = f"""
You are an expert in AI fairness and bias detection. Analyze this decision for potential bias:

DECISION DETAILS:
{self._format_decision(decision)}

DETECTED DEMOGRAPHICS:
{self._format_demographics(demographics)}

HISTORICAL PATTERN ANALYSIS:
- Dataset size: {len(historical_data)}
- Bias score: {bias_score.score}/100
- Risk level: {bias_score.level}
- Metrics: {bias_score.explanation}

Please provide:
1. Specific bias concerns (if any)
2. Fairness assessment
3. Recommended actions
4. Confidence level (0-100%)

Be concise and actionable.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return {
                "analysis": response.text,
                "timestamp": datetime.now().isoformat(),
                "model": self.model_name
            }
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None
    
    def _get_dataset_audit_report(
        self,
        decisions: List[Dict],
        gender_stats: Dict,
        age_stats: Dict,
        race_stats: Dict
    ) -> str:
        """Use Gemini to generate comprehensive dataset audit report"""
        
        prompt = f"""
Generate a fairness audit report for an AI decision-making system:

DATASET OVERVIEW:
- Total decisions: {len(decisions)}

GENDER STATISTICS:
{self._format_stats(gender_stats)}

AGE STATISTICS:
{self._format_stats(age_stats)}

RACE STATISTICS:
{self._format_stats(race_stats)}

Please provide:
1. Summary of fairness findings
2. Identified disparities with severity
3. Protected attributes most impacted
4. Recommendations for improvement
5. Risk assessment for deployment

Be direct and provide actionable insights.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None
    
    def _identify_risky_decisions(
        self,
        decisions: List[Dict],
        outcome_field: str
    ) -> List[Dict]:
        """Identify decisions that appear risky or outliers"""
        risky = []
        
        for decision in decisions:
            # Check for inconsistencies
            demographics = extract_demographics(decision)
            has_sensitive_attrs = any(v["detected"] for v in demographics.values())
            
            if has_sensitive_attrs:
                # Flag for manual review
                risky.append({
                    "decision_id": decision.get("id"),
                    "reason": "Contains sensitive attributes - flagged for fairness review",
                    "demographics_detected": [k for k, v in demographics.items() if v["detected"]]
                })
        
        return risky[:10]  # Return top 10 risky decisions
    
    def _format_decision(self, decision: Dict) -> str:
        """Format decision for Gemini prompt"""
        lines = []
        for key, value in decision.items():
            if isinstance(value, str) and len(value) > 100:
                value = value[:100] + "..."
            lines.append(f"- {key}: {value}")
        return "\n".join(lines)
    
    def _format_demographics(self, demographics: Dict) -> str:
        """Format demographics for Gemini prompt"""
        lines = []
        for attr, info in demographics.items():
            if info["detected"]:
                lines.append(f"- {attr}: {info['value']}")
        return "\n".join(lines) if lines else "- No sensitive attributes detected"
    
    def _format_stats(self, stats: Dict) -> str:
        """Format statistics for Gemini prompt"""
        lines = []
        for group, data in stats.items():
            lines.append(
                f"- {group}: {data['total']} total, "
                f"{data['approved']} approved ({data['approval_rate']:.1%})"
            )
        return "\n".join(lines)
    
    def _generate_audit_summary(
        self,
        gender_disparity: bool,
        age_disparity: bool,
        race_disparity: bool,
        risky_count: int,
        total_count: int
    ) -> str:
        """Generate brief summary of audit findings"""
        disparities = []
        if gender_disparity:
            disparities.append("gender")
        if age_disparity:
            disparities.append("age")
        if race_disparity:
            disparities.append("race")
        
        if not disparities:
            return f"No significant disparities detected in {total_count} decisions."
        
        return (
            f"Significant disparities detected in: {', '.join(disparities)}. "
            f"{risky_count} decisions flagged for review out of {total_count}."
        )
