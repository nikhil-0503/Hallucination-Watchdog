"""
WATCHDOG - API Key Authentication
Production-grade authentication for API access
"""

import os
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from typing import Optional

# API Key configuration
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# In production, load from environment variable or secrets manager
API_KEYS = {
    "dev-key-123": {"role": "user", "tier": "free"},
    "admin-key-456": {"role": "admin", "tier": "premium"},
    os.getenv("WATCHDOG_API_KEY", "default-key"): {"role": "admin", "tier": "premium"}
}

async def verify_api_key(api_key: Optional[str] = Security(api_key_header)) -> dict:
    """
    Verify API key and return user info.
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        dict with user role and tier
        
    Raises:
        HTTPException: If API key is invalid or missing
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Include X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"}
        )
    
    if api_key not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    
    return API_KEYS[api_key]

def require_admin(api_key: str = Security(api_key_header)) -> dict:
    """
    Require admin role for sensitive operations.
    """
    user_info = verify_api_key_sync(api_key)
    if user_info["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user_info

def verify_api_key_sync(api_key: Optional[str]) -> dict:
    """Synchronous version for non-async contexts"""
    if not api_key or api_key not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API key"
        )
    return API_KEYS[api_key]
