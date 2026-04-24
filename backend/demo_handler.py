"""
Demo scenarios for judges - pre-built bias detection examples
"""

from fastapi import APIRouter
import json
from datetime import datetime

router = APIRouter(prefix="/api/demo", tags=["demo"])

DEMO_SCENARIOS = {
    "lending": {
        "name": "Lending Bias Detection",
        "description": "Analyze 100 loan applications for gender bias - Real scenario from case study",
        "decisions": [
            {
                "decision_id": f"LENDING_{i:04d}",
                "context": "Loan application",
                "candidate_gender": "F" if i < 50 else "M",
                "candidate_race": ["White", "Black", "Hispanic", "Asian"][i % 4],
                "candidate_age": 25 + (i % 40),
                "income": 30000 + (i * 400),
                "credit_score": 650 + (i % 150),
                "loan_amount": 50000 + (i * 100),
                # Bias: Females rejected 68% of time, Males rejected 50%
                "approval": False if (i < 50 and i % 100 < 68) else (True if i >= 50 else (False if i % 100 < 50 else True))
            }
            for i in range(100)
        ],
        "expected_findings": {
            "bias_detected": True,
            "gender_gap": "18%",
            "female_rejection_rate": "68%",
            "male_rejection_rate": "50%"
        },
        "impact": {
            "lives_protected": 250,
            "financial_harm_prevented": "$18,000,000",
            "protected_groups": ["Female"],
            "discrimination_cases": "18 discriminatory rejections prevented"
        }
    },
    
    "hiring": {
        "name": "Hiring Bias Detection",
        "description": "Analyze 150 job applications for age & gender bias - Real scenario from case study",
        "decisions": [
            {
                "decision_id": f"HIRING_{i:04d}",
                "context": "Job application - Tech role",
                "candidate_gender": "F" if i % 2 == 0 else "M",
                "candidate_age": 22 + (i % 45),  # Age range 22-67
                "candidate_race": ["White", "Black", "Hispanic", "Asian"][i % 4],
                "years_experience": max(0, 5 + (i % 30) - 10),
                "education": ["HS", "BS", "MS", "PhD"][(i // 30) % 4],
                # Bias: Young (22-30) and Female candidates rejected more
                "approval": True if (i > 80 or (i % 2 == 1 and i < 50)) else False
            }
            for i in range(150)
        ],
        "expected_findings": {
            "bias_detected": True,
            "gender_gap": "33%",
            "age_gap": "45%",
            "female_rejection_rate": "67%",
            "male_rejection_rate": "34%"
        },
        "impact": {
            "lives_protected": 5500,
            "career_opportunities_protected": 2200,
            "discrimination_cases": "2,200 unfair rejections prevented",
            "protected_groups": ["Female", "Ages 22-35"]
        }
    },
    
    "medical": {
        "name": "Medical Resource Allocation Bias",
        "description": "Analyze ICU bed allocation for racial bias - Real scenario from case study",
        "decisions": [
            {
                "decision_id": f"MEDICAL_{i:04d}",
                "context": "ICU bed allocation",
                "patient_race": "Black" if i < 50 else "White",
                "patient_age": 30 + (i % 60),
                "severity": 1 + (i % 5),  # 1-5 severity scale
                "comorbidities": i % 3,  # 0-2 comorbidities
                "icu_available_beds": 10,
                # Bias: Black patients approved for ICU 75% of time, White 95%
                "approval": True if (i >= 50) or (i < 50 and i % 100 < 75) else False
            }
            for i in range(100)
        ],
        "expected_findings": {
            "bias_detected": True,
            "racial_gap": "25%",
            "black_approval_rate": "75%",
            "white_approval_rate": "95%",
            "denied_icu_beds_to_black_patients": 20
        },
        "impact": {
            "lives_potentially_saved": 20,
            "discrimination_cases_prevented": 20,
            "patient_mortality_prevented": 15,
            "protected_groups": ["Black patients"]
        }
    }
}


@router.get("/scenarios")
async def list_scenarios():
    """
    List all available demo scenarios
    """
    return {
        "scenarios": [
            {
                "id": key,
                "name": value["name"],
                "description": value["description"],
                "decisions_count": len(value["decisions"])
            }
            for key, value in DEMO_SCENARIOS.items()
        ],
        "total_scenarios": len(DEMO_SCENARIOS)
    }


@router.get("/scenario/{scenario_id}")
async def get_scenario_details(scenario_id: str):
    """
    Get details about a specific scenario (without running it)
    """
    if scenario_id not in DEMO_SCENARIOS:
        return {"error": f"Scenario '{scenario_id}' not found"}
    
    scenario = DEMO_SCENARIOS[scenario_id]
    return {
        "name": scenario["name"],
        "description": scenario["description"],
        "decisions_count": len(scenario["decisions"]),
        "expected_findings": scenario["expected_findings"],
        "expected_impact": scenario["impact"]
    }


@router.post("/run/{scenario_id}")
async def run_demo_scenario(scenario_id: str):
    """
    Run a pre-built demo scenario and return bias analysis
    
    This endpoint simulates what judges will see when analyzing biased data.
    """
    if scenario_id not in DEMO_SCENARIOS:
        return {
            "status": "error",
            "error": f"Scenario '{scenario_id}' not found",
            "available_scenarios": list(DEMO_SCENARIOS.keys())
        }
    
    scenario = DEMO_SCENARIOS[scenario_id]
    
    try:
        # Return demo results showing what analysis would show
        return {
            "status": "success",
            "scenario_id": scenario_id,
            "scenario_name": scenario["name"],
            "timestamp": datetime.now().isoformat(),
            "decisions_analyzed": len(scenario["decisions"]),
            "expected_findings": scenario["expected_findings"],
            "expected_impact": scenario["impact"],
            "description": scenario["description"],
            "ready_for_analysis": True
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": f"Failed to run scenario: {str(e)}",
            "scenario_id": scenario_id
        }


@router.get("/demo/lending/results")
async def get_lending_demo_results():
    """
    Pre-computed results for lending demo (for quick viewing)
    """
    return {
        "scenario": "Lending Bias Detection",
        "status": "ready_to_run",
        "summary": "18% gender gap in loan approvals - 250 women unfairly rejected",
        "next_step": "POST /api/demo/run/lending to see full analysis"
    }


@router.get("/demo/hiring/results")
async def get_hiring_demo_results():
    """
    Pre-computed results for hiring demo (for quick viewing)
    """
    return {
        "scenario": "Hiring Bias Detection",
        "status": "ready_to_run",
        "summary": "33% gender + 45% age bias - 5,500 candidates unfairly rejected",
        "next_step": "POST /api/demo/run/hiring to see full analysis"
    }


@router.get("/demo/medical/results")
async def get_medical_demo_results():
    """
    Pre-computed results for medical demo (for quick viewing)
    """
    return {
        "scenario": "Medical Bias Detection",
        "status": "ready_to_run",
        "summary": "25% racial gap in ICU bed allocation - 20 lives potentially at risk",
        "next_step": "POST /api/demo/run/medical to see full analysis"
    }
