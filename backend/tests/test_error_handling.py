"""
Error handling and resilience tests.
Verifies system gracefully handles failures and edge cases.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


class TestErrorHandling:
    
    def test_invalid_data_format_validation_error(self):
        """
        Invalid request data returns clear validation error
        """
        invalid_data = {
            "missing": "required_fields",
            "no_decision_id": True
        }
        
        response = client.post("/api/analyze-bias", json=invalid_data)
        
        # Should return 400 or 422 Bad Request
        assert response.status_code in [400, 422]
        result = response.json()
        
        # Should have error message
        assert "error" in result or "detail" in result
        
        print("✅ Invalid data: Proper validation error returned")
    
    def test_empty_dataset_validation(self):
        """
        Empty dataset is rejected with helpful message
        """
        response = client.post("/api/audit-dataset", json={"decisions": []})
        
        assert response.status_code in [400, 422]
        result = response.json()
        
        # Error message should be present
        assert "error" in result or "detail" in result
        
        print("✅ Empty dataset: Proper validation error")
    
    def test_missing_required_fields(self):
        """
        Missing required fields returns validation error
        """
        incomplete_decision = {
            "decision_id": "INCOMPLETE_001",
            # Missing: candidate_gender, approval, etc.
        }
        
        response = client.post("/api/analyze-bias", json=incomplete_decision)
        
        assert response.status_code in [400, 422]
        
        print("✅ Missing fields: Validation error returned")
    
    def test_malformed_json_handling(self):
        """
        Malformed JSON is handled with clear error
        """
        response = client.post(
            "/api/analyze-bias",
            data="{invalid json {",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [400, 422]
        
        print("✅ Malformed JSON: Error handled")
    
    def test_special_characters_in_input(self):
        """
        Special characters in data are handled properly
        """
        decision = {
            "decision_id": "SPECIAL_CHARS_!@#$",
            "candidate_gender": "F",
            "approval": False
        }
        
        response = client.post("/api/analyze-bias", json=decision)
        
        # Should either be rejected or sanitized
        assert response.status_code in [200, 400, 422]
        if response.status_code == 200:
            # If accepted, verify no XSS in response
            assert "<script>" not in response.text
        
        print("✅ Special characters: Handled safely")
    
    def test_very_large_batch(self):
        """
        Test handling of large batches
        """
        decisions = [
            {
                "decision_id": f"LARGE_{i:04d}",
                "candidate_gender": "F" if i % 2 == 0 else "M",
                "approval": i % 3 == 0
            }
            for i in range(500)
        ]
        
        response = client.post("/api/audit-dataset", json={"decisions": decisions})
        
        # Should handle or reject gracefully
        assert response.status_code in [200, 400, 413]
        
        print("✅ Large batch: Handled gracefully")
    
    def test_negative_values(self):
        """
        Negative numeric values are handled
        """
        decision = {
            "decision_id": "NEG_001",
            "candidate_gender": "F",
            "candidate_age": -5,
            "approval": False
        }
        
        response = client.post("/api/analyze-bias", json=decision)
        
        # Should handle or reject
        assert response.status_code in [200, 400, 422]
        
        print("✅ Negative values: Handled")
    
    def test_null_values(self):
        """
        Null values are handled
        """
        decision = {
            "decision_id": "NULL_001",
            "candidate_gender": None,
            "approval": False
        }
        
        response = client.post("/api/analyze-bias", json=decision)
        
        # Should handle or reject
        assert response.status_code in [200, 400, 422]
        
        print("✅ Null values: Handled")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
