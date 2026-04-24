"""
JSON Structured Logging Configuration for WATCHDOG
Emits logs as JSON for production monitoring, analytics, and audit trails

This module provides production-grade logging with full context capture
for bias analysis decisions, API calls, and system events.
"""

import logging
import json
import time
from datetime import datetime
from functools import wraps
from typing import Any, Dict, Optional


class StructuredLogger:
    """
    Emit logs as JSON for monitoring, analytics, and compliance.
    
    Each log entry includes:
    - Timestamp (ISO 8601)
    - Event type
    - Service identifier
    - Custom fields (decision_id, bias_score, etc.)
    
    Example:
        logger = StructuredLogger(__name__)
        logger.log_decision_analyzed(
            decision_id="dec_123",
            bias_score=42.5,
            protected_attributes=["gender", "age"],
            duration_ms=1250
        )
    
    Output:
        {"timestamp": "2024-04-24T10:30:45.123Z", "event_type": "decision_analyzed", 
         "decision_id": "dec_123", "bias_score": 42.5, ...}
    """
    
    def __init__(self, name: str):
        """Initialize logger with JSON formatting"""
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Only add handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter('%(message)s'))
            self.logger.addHandler(handler)
    
    @staticmethod
    def _get_timestamp() -> str:
        """Get current timestamp in ISO 8601 format"""
        return datetime.utcnow().isoformat() + "Z"
    
    def log_event(self, event_type: str, **kwargs) -> None:
        """
        Log any event as JSON with timestamp and context.
        
        Args:
            event_type: Type of event (decision_analyzed, api_error, etc.)
            **kwargs: Additional fields to include in log
        """
        log_data = {
            "timestamp": self._get_timestamp(),
            "event_type": event_type,
            "service": "bias_engine",
            **kwargs
        }
        self.logger.info(json.dumps(log_data))
    
    def log_decision_analyzed(self, decision_id: str, bias_score: float,
                             protected_attributes: list, duration_ms: float,
                             gemini_used: bool = False) -> None:
        """
        Log when a decision is analyzed for bias.
        
        Used by: /api/analyze-bias endpoint
        
        Args:
            decision_id: Unique identifier for the decision
            bias_score: Calculated bias score (0-100)
            protected_attributes: List of detected demographic attributes
            duration_ms: Execution time in milliseconds
            gemini_used: Whether Gemini API was called
        """
        self.log_event(
            "decision_analyzed",
            decision_id=decision_id,
            bias_score=round(bias_score, 2),
            bias_level=self._get_bias_level(bias_score),
            protected_attributes=protected_attributes,
            duration_ms=round(duration_ms, 2),
            severity=self._get_severity(bias_score),
            gemini_used=gemini_used
        )
    
    def log_dataset_audit_complete(self, audit_id: str, total_decisions: int,
                                   critical_count: int, high_count: int,
                                   duration_seconds: float) -> None:
        """
        Log when dataset audit completes.
        
        Used by: /api/audit-dataset endpoint
        
        Args:
            audit_id: Unique identifier for the audit
            total_decisions: Total decisions analyzed
            critical_count: Number of critical bias decisions
            high_count: Number of high bias decisions
            duration_seconds: Total execution time
        """
        critical_percentage = (critical_count / total_decisions * 100) if total_decisions > 0 else 0
        
        self.log_event(
            "dataset_audit_complete",
            audit_id=audit_id,
            total_decisions=total_decisions,
            critical_decisions=critical_count,
            high_decisions=high_count,
            critical_percentage=round(critical_percentage, 2),
            duration_seconds=round(duration_seconds, 2),
            avg_time_per_decision_ms=round(duration_seconds * 1000 / max(total_decisions, 1), 2)
        )
    
    def log_api_request(self, endpoint: str, method: str, user_id: Optional[str] = None) -> None:
        """
        Log incoming API request.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method (GET, POST, etc.)
            user_id: Optional user identifier
        """
        self.log_event(
            "api_request",
            endpoint=endpoint,
            method=method,
            user_id=user_id,
            severity="INFO"
        )
    
    def log_api_response(self, endpoint: str, status_code: int, response_time_ms: float) -> None:
        """
        Log API response.
        
        Args:
            endpoint: API endpoint path
            status_code: HTTP status code
            response_time_ms: Response time in milliseconds
        """
        self.log_event(
            "api_response",
            endpoint=endpoint,
            status_code=status_code,
            response_time_ms=round(response_time_ms, 2),
            status="success" if status_code < 400 else "error",
            severity="INFO" if status_code < 400 else "ERROR"
        )
    
    def log_api_error(self, endpoint: str, error_msg: str, status_code: int,
                     traceback: Optional[str] = None, user_id: Optional[str] = None) -> None:
        """
        Log API errors with full context.
        
        Args:
            endpoint: API endpoint path
            error_msg: Error message
            status_code: HTTP status code
            traceback: Optional stack trace
            user_id: Optional user identifier
        """
        self.log_event(
            "api_error",
            endpoint=endpoint,
            error=error_msg,
            status_code=status_code,
            traceback=traceback,
            user_id=user_id,
            severity="ERROR"
        )
    
    def log_gemini_call(self, decision_id: str, input_tokens: int, output_tokens: int,
                       duration_ms: float, success: bool = True) -> None:
        """
        Log Gemini API calls for monitoring and cost tracking.
        
        Args:
            decision_id: Associated decision ID
            input_tokens: Tokens used for input
            output_tokens: Tokens used for output
            duration_ms: API call duration
            success: Whether call succeeded
        """
        total_tokens = input_tokens + output_tokens
        # Approximate cost (varies by model)
        cost_estimate = total_tokens * 0.00001  # ~$0.00001 per token
        
        self.log_event(
            "gemini_api_call",
            decision_id=decision_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            duration_ms=round(duration_ms, 2),
            cost_estimate_usd=round(cost_estimate, 6),
            success=success,
            severity="INFO" if success else "WARNING"
        )
    
    def log_performance_metric(self, metric_name: str, value: float, unit: str) -> None:
        """
        Log performance metrics for monitoring.
        
        Args:
            metric_name: Name of metric (requests_per_second, memory_usage, etc.)
            value: Metric value
            unit: Unit of measurement
        """
        self.log_event(
            "performance_metric",
            metric_name=metric_name,
            value=round(value, 2),
            unit=unit,
            severity="INFO"
        )
    
    def log_system_event(self, event_name: str, description: str, severity: str = "INFO") -> None:
        """
        Log system events (startup, shutdown, health checks, etc.).
        
        Args:
            event_name: Name of system event
            description: Event description
            severity: Severity level (INFO, WARNING, ERROR)
        """
        self.log_event(
            "system_event",
            event_name=event_name,
            description=description,
            severity=severity
        )
    
    @staticmethod
    def _get_bias_level(score: float) -> str:
        """Convert bias score to human-readable level"""
        if score < 10:
            return "LOW"
        elif score < 25:
            return "MEDIUM"
        elif score < 50:
            return "HIGH"
        else:
            return "CRITICAL"
    
    @staticmethod
    def _get_severity(score: float) -> str:
        """Convert bias score to log severity level"""
        if score < 10:
            return "INFO"
        elif score < 25:
            return "WARNING"
        else:
            return "CRITICAL"


def log_execution_time(logger: StructuredLogger):
    """
    Decorator to automatically log function execution time and results.
    
    Usage:
        @log_execution_time(logger)
        async def analyze_decision(decision):
            # Function automatically logged
            pass
    
    Logs:
        - function_name
        - duration_ms
        - status (success/error)
        - error message (if failed)
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = (time.time() - start) * 1000
                logger.log_event(
                    "function_executed",
                    function_name=func.__name__,
                    duration_ms=round(duration, 2),
                    status="success",
                    severity="INFO"
                )
                return result
            except Exception as e:
                duration = (time.time() - start) * 1000
                logger.log_event(
                    "function_error",
                    function_name=func.__name__,
                    duration_ms=round(duration, 2),
                    error=str(e),
                    severity="ERROR"
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = func(*args, **kwargs)
                duration = (time.time() - start) * 1000
                logger.log_event(
                    "function_executed",
                    function_name=func.__name__,
                    duration_ms=round(duration, 2),
                    status="success",
                    severity="INFO"
                )
                return result
            except Exception as e:
                duration = (time.time() - start) * 1000
                logger.log_event(
                    "function_error",
                    function_name=func.__name__,
                    duration_ms=round(duration, 2),
                    error=str(e),
                    severity="ERROR"
                )
                raise
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Global logger instance
logger = StructuredLogger(__name__)


# Example usage in routes.py:
# ============================
# from app.logging_config import logger
# import time
#
# @router.post("/api/analyze-bias")
# async def analyze_bias(request: BiasAnalysisRequest):
#     start = time.time()
#     
#     # Analyze bias
#     result = await analyzer.analyze_decision(request.decision)
#     duration = (time.time() - start) * 1000
#     
#     # Log the analysis
#     logger.log_decision_analyzed(
#         decision_id=result.get('decision_id', 'unknown'),
#         bias_score=result['bias_score']['score'],
#         protected_attributes=list(result.get('demographics', {}).keys()),
#         duration_ms=duration,
#         gemini_used=result.get('used_gemini', False)
#     )
#     
#     return result
