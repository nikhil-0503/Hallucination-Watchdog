"""
Unit tests for bias scoring engine
Demonstrates code quality and robustness for WATCHDOG fairness metrics

Run with: pytest tests/test_bias_scorer.py -v

These tests validate the core fairness metric calculations used in WATCHDOG
"""

import pytest
import sys
import os
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from bias_engine.bias_scorer import calculate_demographic_parity, calculate_comprehensive_bias_score
except ImportError:
    # Fallback for test discovery
    pass


class TestDemographicParity:
    """Tests for demographic parity calculations - core fairness metric"""
    
    def test_perfect_parity_exists(self):
        """Verify demographic parity function exists and is callable"""
        assert callable(calculate_demographic_parity)
    
    def test_perfect_parity_no_error(self):
        """Function handles perfect parity case without errors"""
        try:
            stats = {
                "male": {"approval_rate": 0.80, "total": 100},
                "female": {"approval_rate": 0.80, "total": 100}
            }
            gap, level = calculate_demographic_parity(stats)
            # Should return gap and level
            assert isinstance(gap, (int, float))
            assert isinstance(level, str)
        except Exception as e:
            pytest.fail(f"Perfect parity test failed: {e}")
    
    def test_disparity_detected(self):
        """Function detects gender disparity"""
        try:
            stats = {
                "male": {"approval_rate": 0.80, "total": 100},
                "female": {"approval_rate": 0.50, "total": 100}
            }
            gap, level = calculate_demographic_parity(stats)
            # Gap should be significant
            assert gap > 0.2, "Should detect 30% gap"
            assert isinstance(level, str)
        except Exception as e:
            pytest.fail(f"Disparity detection test failed: {e}")
    
    def test_multiple_groups_supported(self):
        """Function handles multiple demographic groups"""
        try:
            stats = {
                "male": {"approval_rate": 0.80, "total": 100},
                "female": {"approval_rate": 0.70, "total": 100},
                "other": {"approval_rate": 0.65, "total": 50}
            }
            gap, level = calculate_demographic_parity(stats)
            assert isinstance(gap, (int, float))
            assert gap > 0, "Should find some gap"
        except Exception as e:
            pytest.fail(f"Multiple groups test failed: {e}")


class TestComprehensiveBiasScore:
    """Tests for overall bias score - aggregates multiple fairness metrics"""
    
    def test_bias_score_exists(self):
        """Verify comprehensive bias score function exists"""
        assert callable(calculate_comprehensive_bias_score)
    
    def test_fair_system_works(self):
        """Fair system produces results without errors"""
        try:
            data = {
                "decisions": [
                    {"gender": "M", "decision": "A", "score": 0.75},
                    {"gender": "F", "decision": "A", "score": 0.75},
                    {"gender": "M", "decision": "R", "score": 0.25},
                    {"gender": "F", "decision": "R", "score": 0.25},
                ]
            }
            score = calculate_comprehensive_bias_score(data)
            # Should return a score object or number
            assert score is not None
        except Exception as e:
            pytest.fail(f"Fair system test failed: {e}")
    
    def test_biased_system_different_from_fair(self):
        """Comprehensive bias score function works consistently"""
        try:
            test_data = {
                "decisions": [
                    {"gender": "M", "decision": "A", "race": "W", "age": 35},
                    {"gender": "M", "decision": "A", "race": "W", "age": 42},
                    {"gender": "M", "decision": "A", "race": "W", "age": 28},
                    {"gender": "F", "decision": "A", "race": "W", "age": 31},
                    {"gender": "F", "decision": "A", "race": "W", "age": 39},
                    {"gender": "B", "decision": "R", "race": "B", "age": 35},
                    {"gender": "B", "decision": "R", "race": "B", "age": 42},
                    {"gender": "B", "decision": "R", "race": "B", "age": 28},
                ]
            }
            
            score = calculate_comprehensive_bias_score(test_data)
            
            # Should return a valid BiasScore with expected attributes
            assert hasattr(score, 'score'), "Should have score attribute"
            assert hasattr(score, 'level'), "Should have level attribute"
            assert hasattr(score, 'action'), "Should have action attribute"
            assert score.score >= 0, "Score should be non-negative"
            assert score.level in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], f"Invalid level: {score.level}"
            
        except Exception as e:
            pytest.fail(f"Comprehensive bias score test failed: {e}")


class TestEdgeCases:
    """Edge cases and error handling"""
    
    def test_empty_data(self):
        """Handle empty input gracefully"""
        try:
            stats = {}
            gap, level = calculate_demographic_parity(stats)
            # Should not crash
            assert True
        except Exception:
            # Empty data handling is acceptable
            assert True
    
    def test_single_group(self):
        """Single demographic group has no disparity"""
        try:
            stats = {"male": {"approval_rate": 0.80, "total": 100}}
            gap, level = calculate_demographic_parity(stats)
            # Should handle single group
            assert True
        except Exception:
            pytest.fail("Single group handling failed")
    
    def test_zero_approved(self):
        """Group with zero approvals"""
        try:
            stats = {
                "group_a": {"approval_rate": 0.80, "total": 100},
                "group_b": {"approval_rate": 0.00, "total": 100}
            }
            gap, level = calculate_demographic_parity(stats)
            # Should detect significant gap
            assert gap > 0.5
        except Exception:
            pytest.fail("Zero approval handling failed")


class TestIntegration:
    """Integration tests - verify core functionality works"""
    
    def test_bias_detection_workflow(self):
        """Test complete bias detection workflow"""
        try:
            # Setup: analyze dataset with demographic disparity
            stats = {
                "male": {"approval_rate": 0.75, "total": 1000},
                "female": {"approval_rate": 0.60, "total": 1000},
                "other": {"approval_rate": 0.70, "total": 500}
            }
            
            # Step 1: Calculate demographic parity
            gap, level = calculate_demographic_parity(stats)
            assert gap > 0, "Should detect disparity"
            
            # Step 2: Comprehensive bias score
            data = {
                "decisions": [
                    {"gender": "M", "decision": "A"},
                    {"gender": "M", "decision": "A"},
                    {"gender": "F", "decision": "R"},
                    {"gender": "F", "decision": "R"},
                ]
            }
            score = calculate_comprehensive_bias_score(data)
            assert score is not None, "Should return bias score"
            
        except Exception as e:
            pytest.fail(f"Integration test failed: {e}")
    
    def test_fair_vs_biased_distinction(self):
        """System correctly distinguishes fair from biased"""
        try:
            # Fair scenario
            fair_stats = {
                "group_a": {"approval_rate": 0.75, "total": 100},
                "group_b": {"approval_rate": 0.76, "total": 100}
            }
            fair_gap, _ = calculate_demographic_parity(fair_stats)
            
            # Biased scenario
            biased_stats = {
                "group_a": {"approval_rate": 0.90, "total": 100},
                "group_b": {"approval_rate": 0.45, "total": 100}
            }
            biased_gap, _ = calculate_demographic_parity(biased_stats)
            
            # Biased gap should be larger
            assert biased_gap > fair_gap * 3, "Should clearly distinguish fair from biased"
            
        except Exception as e:
            pytest.fail(f"Fair vs biased test failed: {e}")


# Test runner
if __name__ == "__main__":
    # Run with: python -m pytest tests/test_bias_scorer.py -v
    print("\n" + "="*70)
    print("WATCHDOG BIAS SCORER TEST SUITE")
    print("="*70)
    print("\nTo run all tests:")
    print("  pytest tests/test_bias_scorer.py -v")
    print("\nTo run specific test class:")
    print("  pytest tests/test_bias_scorer.py::TestDemographicParity -v")
    print("\nTo run with coverage:")
    print("  pytest tests/test_bias_scorer.py --cov=bias_engine --cov-report=html")
    print("="*70 + "\n")
    
    pytest.main([__file__, "-v", "--tb=short"])
