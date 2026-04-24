"""
Explainability Module for WATCHDOG
Converts technical bias scores into human-readable, actionable explanations.

This module transforms complex fairness metrics into business language
that stakeholders (judges, executives, compliance teams) can understand.
"""

from typing import Dict, List, Any, Tuple
from enum import Enum


class BiasLevel(Enum):
    """Bias severity levels"""
    LOW = ("LOW", "✅", "Excellent", "Low risk")
    MEDIUM = ("MEDIUM", "⚠️", "Concerning", "Medium risk")
    HIGH = ("HIGH", "🔴", "Significant", "High risk")
    CRITICAL = ("CRITICAL", "🚨", "Severe", "Critical risk")


class BiasExplainer:
    """
    Generate human-readable explanations for technical bias scores
    and fairness metrics.
    """
    
    @staticmethod
    def explain_bias_score(bias_score: float) -> Tuple[str, str, str]:
        """
        Convert a bias score to plain English explanation.
        
        Returns:
            Tuple of (emoji_status, severity_level, explanation)
        
        Args:
            bias_score: Score from 0-100
        
        Example:
            >>> emoji, level, explanation = explain_bias_score(42)
            >>> # emoji = "🔴"
            >>> # level = "HIGH"
            >>> # explanation = "Significant bias detected..."
        """
        
        if bias_score < 10:
            return (
                "✅ **LOW BIAS RISK**",
                "GREEN",
                "This decision appears fair across demographic groups. "
                "No significant discrimination detected. "
                "Risk level: ACCEPTABLE"
            )
        elif bias_score < 25:
            return (
                "⚠️ **MODERATE BIAS CONCERN**",
                "YELLOW",
                "Some demographic groups are treated less favorably. "
                "The disparity is measurable but not severe. "
                "Action: Review decision criteria and consider interventions."
            )
        elif bias_score < 50:
            return (
                "🔴 **HIGH BIAS RISK**",
                "ORANGE",
                "Significant discrimination detected affecting protected groups. "
                "Multiple demographic groups have substantially different outcomes. "
                "Action: Immediate review and correction recommended."
            )
        else:
            return (
                "🚨 **CRITICAL FAIRNESS VIOLATION**",
                "RED",
                "Severe systemic discrimination detected. "
                "Major demographic disparities in decision outcomes. "
                "Action: BLOCK this decision and implement immediate remediation."
            )
    
    @staticmethod
    def explain_demographic_disparity(
        demographic_group_1: str,
        rate_1: float,
        demographic_group_2: str,
        rate_2: float,
        decision_type: str = "approval"
    ) -> str:
        """
        Explain demographic disparity in plain business language.
        
        Args:
            demographic_group_1: First group (e.g., "male")
            rate_1: Rate for first group (0-1)
            demographic_group_2: Second group (e.g., "female")
            rate_2: Rate for second group (0-1)
            decision_type: Type of decision (e.g., "approval", "interview", "allocation")
        
        Returns:
            Human-readable explanation of the disparity
        
        Example:
            >>> explain_demographic_disparity("male", 0.75, "female", 0.62, "approval")
            >>> # "Males are approved at 75% rate, females at 62% rate.
            >>> #  This 13% gap indicates potential gender discrimination."
        """
        gap = abs(rate_1 - rate_2)
        higher_group = demographic_group_1 if rate_1 > rate_2 else demographic_group_2
        lower_group = demographic_group_2 if rate_1 > rate_2 else demographic_group_1
        higher_rate = max(rate_1, rate_2)
        lower_rate = min(rate_1, rate_2)
        
        gap_percentage = gap * 100
        
        # Interpret the gap
        if gap_percentage < 2:
            significance = "negligible"
            concern = "No significant difference"
        elif gap_percentage < 5:
            significance = "small"
            concern = "Acceptable variance"
        elif gap_percentage < 15:
            significance = "moderate"
            concern = "Concerning disparity"
        elif gap_percentage < 25:
            significance = "significant"
            concern = "Major disparity"
        else:
            significance = "severe"
            concern = "Critical disparity"
        
        return (
            f"**Demographic Disparity Analysis:**\n\n"
            f"- **{higher_group.capitalize()} {decision_type} rate:** {higher_rate*100:.1f}%\n"
            f"- **{lower_group.capitalize()} {decision_type} rate:** {lower_rate*100:.1f}%\n"
            f"- **Gap:** {gap_percentage:.1f}% ({significance})\n"
            f"- **Assessment:** {concern}\n\n"
            f"**Interpretation:** "
            f"{higher_group.capitalize()}s are {gap_percentage:.1f}% more likely to be {decision_type}d than "
            f"{lower_group}s. This disparity may indicate discrimination."
        )
    
    @staticmethod
    def recommend_action(bias_score: float, critical_factors: List[str] = None) -> Tuple[str, str, List[str]]:
        """
        Generate specific, actionable recommendations based on bias score.
        
        Returns:
            Tuple of (action_code, explanation, next_steps)
        
        Args:
            bias_score: Score from 0-100
            critical_factors: List of factors driving bias (e.g., ["employment_gaps", "school_prestige"])
        
        Example:
            >>> action, explanation, steps = recommend_action(
            ...     bias_score=42,
            ...     critical_factors=["employment_gaps"]
            ... )
            >>> # action = "FLAG_FOR_REVIEW"
            >>> # explanation = "High bias detected. Do not deploy..."
            >>> # steps = ["1. Identify employment_gaps", "2. Remove or adjust...", ...]
        """
        
        if bias_score < 10:
            action_code = "ALLOW"
            action_emoji = "✅"
            explanation = "Low bias risk. Proceed with decision."
        elif bias_score < 25:
            action_code = "WARN"
            action_emoji = "⚠️"
            explanation = "Moderate bias detected. Review decision criteria before deploying at scale."
        elif bias_score < 50:
            action_code = "FLAG_FOR_REVIEW"
            action_emoji = "🔴"
            explanation = "High bias risk. Do not deploy in production until bias is addressed."
        else:
            action_code = "BLOCK"
            action_emoji = "🚨"
            explanation = "Critical discrimination detected. Halt deployment immediately."
        
        # Generate action items
        action_items = []
        
        if critical_factors:
            for factor in critical_factors[:3]:  # Top 3 factors
                if "employment_gaps" in factor:
                    action_items.append("1. **Examine employment gaps** - This may disproportionately affect women")
                elif "school_prestige" in factor:
                    action_items.append("1. **Review school rankings** - Proxy for socioeconomic status")
                elif "years_experience" in factor:
                    action_items.append("1. **Re-evaluate experience weighting** - May penalize older workers")
                elif "degree_major" in factor:
                    action_items.append("1. **Check degree major weights** - STEM disparities by gender")
                elif "age" in factor:
                    action_items.append("1. **Age bias detected** - Review age-related criteria")
                elif "gender" in factor:
                    action_items.append("1. **Gender bias detected** - Review all gender-correlated variables")
                elif "race" in factor or "ethnicity" in factor:
                    action_items.append("1. **Racial/ethnic bias detected** - Audit for proxy variables")
                else:
                    action_items.append(f"1. **Investigate {factor.replace('_', ' ')}** - Review for bias")
        
        if action_code == "ALLOW":
            action_items.append("2. Monitor regularly to maintain fairness")
        elif action_code == "WARN":
            action_items.append("2. Conduct fairness audit before large-scale deployment")
            action_items.append("3. Consider retraining model with fairness constraints")
        elif action_code == "FLAG_FOR_REVIEW":
            action_items.append("2. Assemble ethics/compliance review board")
            action_items.append("3. Remove proxy variables and retrain")
            action_items.append("4. Add fairness constraints to algorithm")
            action_items.append("5. Conduct fairness audit on retrained model")
        else:  # BLOCK
            action_items.append("2. DO NOT proceed with current model")
            action_items.append("3. Immediately halt any deployments using this model")
            action_items.append("4. Conduct comprehensive bias investigation")
            action_items.append("5. Retrain with debiased data and fairness constraints")
            action_items.append("6. Pass ethics review before any future deployment")
        
        return (
            f"{action_emoji} {action_code}",
            explanation,
            action_items if action_items else ["Monitor and maintain fairness monitoring"]
        )
    
    @staticmethod
    def explain_metric(metric_name: str, metric_value: float, threshold: float = None) -> str:
        """
        Explain what a specific fairness metric means in business terms.
        
        Args:
            metric_name: Name of metric (e.g., "demographic_parity", "equal_opportunity")
            metric_value: The calculated value
            threshold: Optional threshold for interpretation
        
        Returns:
            Plain-English explanation of the metric
        """
        
        explanations = {
            "demographic_parity": (
                f"**Demographic Parity (Gap: {metric_value*100:.1f}%)**\n\n"
                f"This measures if all demographic groups have similar decision outcomes.\n\n"
                f"- Gap = 0%: Perfect parity (all groups treated equally)\n"
                f"- Gap < 5%: Acceptable variance\n"
                f"- Gap 5-20%: Concerning disparity\n"
                f"- Gap > 20%: Severe disparity indicating likely discrimination\n\n"
                f"Your gap: {metric_value*100:.1f}% - "
                f"{'✅ Acceptable' if metric_value < 0.05 else '⚠️ Concerning' if metric_value < 0.20 else '🚨 Severe'}"
            ),
            
            "equal_opportunity": (
                f"**Equal Opportunity (Gap: {metric_value*100:.1f}%)**\n\n"
                f"This measures if qualified candidates from all groups have equal chance of approval.\n\n"
                f"- Gap = 0%: Equal opportunity (qualified people treated equally)\n"
                f"- Gap < 5%: Acceptable fairness in opportunity\n"
                f"- Gap > 15%: Discrimination against qualified applicants\n\n"
                f"Your gap: {metric_value*100:.1f}% - "
                f"{'✅ Fair' if metric_value < 0.05 else '⚠️ Concerning' if metric_value < 0.15 else '🚨 Discriminatory'}"
            ),
            
            "calibration": (
                f"**Calibration (Gap: {metric_value*100:.1f}%)**\n\n"
                f"This measures if prediction confidence is consistent across demographic groups.\n\n"
                f"- Gap = 0%: Perfectly calibrated (confidence accurate for all groups)\n"
                f"- Gap < 10%: Well-calibrated\n"
                f"- Gap > 20%: Poorly calibrated (overconfident for some groups)\n\n"
                f"Your gap: {metric_value*100:.1f}% - "
                f"{'✅ Well-calibrated' if metric_value < 0.10 else '⚠️ Poorly calibrated'}"
            ),
        }
        
        return explanations.get(metric_name, f"Metric: {metric_name} = {metric_value:.2f}")
    
    @staticmethod
    def create_executive_summary(
        decision_id: str,
        bias_score: float,
        critical_factors: List[str],
        demographic_disparities: Dict[str, float],
        gemini_analysis: str = None
    ) -> str:
        """
        Create a one-page executive summary for decision-makers.
        
        Args:
            decision_id: ID of the decision being analyzed
            bias_score: Overall bias score (0-100)
            critical_factors: Top factors driving bias
            demographic_disparities: Dict of demographic groups and their disparities
            gemini_analysis: Optional Gemini AI analysis
        
        Returns:
            Formatted executive summary
        """
        
        status_emoji, severity, explanation = BiasExplainer.explain_bias_score(bias_score)
        action, action_explanation, action_items = BiasExplainer.recommend_action(bias_score, critical_factors)
        
        summary = f"""
╔════════════════════════════════════════════════════════════════╗
║           WATCHDOG FAIRNESS AUDIT - EXECUTIVE SUMMARY          ║
╚════════════════════════════════════════════════════════════════╝

📋 **DECISION ID:** {decision_id}
📊 **OVERALL BIAS SCORE:** {bias_score:.1f}/100

{status_emoji}
{explanation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**DEMOGRAPHIC DISPARITIES:**
"""
        
        for group, disparity in demographic_disparities.items():
            disparity_pct = disparity * 100
            status = "✅" if disparity_pct < 5 else "⚠️" if disparity_pct < 15 else "🚨"
            summary += f"\n  {status} {group.capitalize():20s} {disparity_pct:6.1f}% gap"
        
        summary += f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL FACTORS:**
"""
        for i, factor in enumerate(critical_factors[:5], 1):
            summary += f"\n  {i}. {factor}"
        
        summary += f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{action}
{action_explanation}

**RECOMMENDED ACTIONS:**
"""
        for item in action_items:
            summary += f"\n  • {item}"
        
        if gemini_analysis:
            summary += f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**AI ANALYSIS (Gemini):**
{gemini_analysis}
"""
        
        summary += "\n\n╔════════════════════════════════════════════════════════════════╗\n"
        
        return summary


# Example usage:
# ==============
#
# # Explain a bias score
# emoji, level, explanation = BiasExplainer.explain_bias_score(42)
# print(explanation)
#
# # Get recommendations
# action, explanation, items = BiasExplainer.recommend_action(
#     bias_score=42,
#     critical_factors=["employment_gaps", "school_prestige"]
# )
# print(f"{action}: {explanation}")
# for item in items:
#     print(f"  - {item}")
#
# # Create executive summary
# summary = BiasExplainer.create_executive_summary(
#     decision_id="DEC_12345",
#     bias_score=42.5,
#     critical_factors=["employment_gaps", "school_prestige"],
#     demographic_disparities={
#         "female": 0.15,
#         "male": 0.02,
#         "older_workers": 0.25
#     },
#     gemini_analysis="The system shows significant age and gender bias..."
# )
# print(summary)
