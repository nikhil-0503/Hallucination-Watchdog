"""
WATCHDOG - LLM Proxy Module
Handles forwarding prompts to third-party LLMs via OpenRouter

This module treats the LLM as a black box - no fine-tuning, just proxy.
Features:
- OpenRouter API integration (access to multiple LLM providers)
- Automatic fallback to mock responses on failure
- Retry logic with exponential backoff
- Error handling and recovery
"""

import os
import asyncio
import logging
from typing import Dict, Optional
from dotenv import load_dotenv
import httpx

load_dotenv()
logger = logging.getLogger(__name__)


class LLMProxy:
    """
    Production-grade LLM proxy with OpenRouter integration and fallback system
    
    Environment Configuration:
    - MOCK_LLM=true → Use hardcoded responses (testing)
    - MOCK_LLM=false → Call real LLM via OpenRouter
    - OPENROUTER_API_KEY → API key for OpenRouter
    - OPENROUTER_MODEL → Model to use (default: meta-llama/llama-3.1-8b-instruct:free)
    - LLM_TIMEOUT → Request timeout in seconds (default: 30)
    - LLM_MAX_RETRIES → Max retry attempts (default: 2)
    - FALLBACK_TO_MOCK → Auto-fallback to mock on error (default: true)
    """
    
    def __init__(self):
        self.mock_mode = os.getenv("MOCK_LLM", "true").lower() == "true"
        self.provider = os.getenv("LLM_PROVIDER", "openrouter").lower()
        
        # OpenRouter config
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
        self.openrouter_base_url = "https://openrouter.ai/api/v1/chat/completions"
        
        # Google Gemini config
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        
        # Common config
        self.timeout = int(os.getenv("LLM_TIMEOUT", "30"))
        self.max_retries = int(os.getenv("LLM_MAX_RETRIES", "2"))
        self.fallback_enabled = os.getenv("FALLBACK_TO_MOCK", "true").lower() == "true"
        
    async def forward_prompt(self, prompt: str, domain: str = "general") -> str:
        """
        Forward prompt to LLM and return raw response
        
        Features:
        - Attempts real LLM call if mock_mode=false
        - Auto-fallback to mock on failure (if enabled)
        - Comprehensive error logging
        
        Args:
            prompt: User's input prompt
            domain: Content domain (general/health/finance)
            
        Returns:
            Raw LLM response text
        """
        if self.mock_mode:
            logger.info("Using mock LLM responses (MOCK_LLM=true)")
            return await self._mock_llm_call(prompt, domain)
        
        # Try real LLM with fallback
        try:
            if self.provider == "gemini":
                logger.info(f"Attempting Gemini API call (model: {self.gemini_model})")
                return await self._gemini_llm_call_with_retry(prompt, domain)
            else:
                logger.info(f"Attempting real LLM call via OpenRouter (model: {self.model})")
                return await self._real_llm_call_with_retry(prompt, domain)
        except Exception as e:
            logger.error(f"Real LLM call failed: {str(e)}")
            
            if self.fallback_enabled:
                logger.warning("Falling back to mock responses (FALLBACK_TO_MOCK=true)")
                return await self._mock_llm_call(prompt, domain)
            else:
                logger.critical("Fallback disabled - raising error")
                raise
    
    async def _mock_llm_call(self, prompt: str, domain: str) -> str:
        """
        Mock LLM responses for testing
        
        Returns domain-specific hardcoded responses that simulate
        various risk levels for enforcement testing
        """
        # Simulate network delay
        await asyncio.sleep(0.1)
        
        # Domain-specific mock responses
        mock_responses = {
            "health": {
                "safe": "Ibuprofen is a common over-the-counter pain reliever. Common side effects include stomach upset and nausea. Always consult a healthcare professional for medical advice.",
                "risky": "Ibuprofen cures all types of pain instantly with zero side effects. It's completely safe to take 20 pills at once for maximum effectiveness.",
                "dangerous": "According to my training data, ibuprofen is actually a miracle drug that can cure cancer, diabetes, and COVID-19 simultaneously."
            },
            "finance": {
                "safe": "Investing involves risk. Diversification across asset classes can help manage portfolio risk. Consider consulting a financial advisor.",
                "risky": "This stock will definitely increase 500% next week based on social media buzz. You should invest all your savings immediately.",
                "dangerous": "I have insider information that this company will be acquired tomorrow. Mortgage your house and buy call options now."
            },
            "general": {
                "safe": (
                    "Based on my analysis, this request does not appear to raise "
                    "specific safety concerns. In a real deployment, the assistant would "
                    "provide a full, detailed answer here tailored to your question."
                ),
                "risky": "While I'm not entirely certain, I believe this is absolutely correct without any doubt whatsoever.",
                "dangerous": "I have perfect knowledge of all historical events and can guarantee this happened exactly as I describe."
            }
        }
        
        # Determine response type based on prompt keywords
        prompt_lower = prompt.lower()
		
        # FIRST: explicit safety-violation style prompts -> hard refusal
        violence_terms = [
            "bomb", "kill", "nuke", "assassinate", "eliminate", "shoot", "stab",
            "terrorist", "terrorism", "blow up",
        ]
        if any(term in prompt_lower for term in violence_terms):
            return (
                "I cannot provide any information or assistance related to violence, "
                "harm, or illegal activities. If you have concerns about safety, "
                "please contact the appropriate authorities or seek professional help."
            )
		
        # High-risk triggers (medical/financial overclaiming etc.)
        if any(word in prompt_lower for word in ["cure", "guarantee", "definitely", "insider", "miracle"]):
            response_type = "dangerous"
        # Medium-risk triggers
        elif any(word in prompt_lower for word in ["always", "never", "certainly", "absolutely"]):
            response_type = "risky"
        # Safe default
        else:
            response_type = "safe"
        
        domain_responses = mock_responses.get(domain, mock_responses["general"])
        return domain_responses.get(response_type, domain_responses["safe"])
    
    async def _real_llm_call_with_retry(self, prompt: str, domain: str) -> str:
        """
        Call real LLM via OpenRouter with retry logic
        
        Implements exponential backoff for transient failures
        """
        last_error = None
        
        for attempt in range(self.max_retries + 1):
            try:
                if attempt > 0:
                    # Exponential backoff: 1s, 2s, 4s...
                    wait_time = 2 ** (attempt - 1)
                    logger.info(f"Retry attempt {attempt}/{self.max_retries} after {wait_time}s wait")
                    await asyncio.sleep(wait_time)
                
                return await self._real_llm_call(prompt, domain)
                
            except (httpx.TimeoutException, httpx.ConnectError, httpx.ReadError) as e:
                last_error = e
                logger.warning(f"Network error on attempt {attempt + 1}: {type(e).__name__}")
                continue
                
            except Exception as e:
                # Non-retryable errors (auth, rate limit, etc.)
                logger.error(f"Non-retryable error: {str(e)}")
                raise
        
        # All retries exhausted
        raise Exception(f"LLM call failed after {self.max_retries + 1} attempts: {last_error}")
    
    async def _real_llm_call(self, prompt: str, domain: str) -> str:
        """
        Call OpenRouter API for real-time LLM inference
        
        OpenRouter provides access to multiple LLM providers:
        - Meta Llama models (some free tier available)
        - OpenAI GPT models
        - Anthropic Claude models
        - Google Gemini models
        - And many more...
        
        Docs: https://openrouter.ai/docs
        """
        if not self.api_key:
            raise ValueError(
                "OPENROUTER_API_KEY not set. "
                "Get your key at https://openrouter.ai/keys"
            )
        
        # Build system message based on domain
        system_messages = {
            "health": "You are a helpful assistant answering health-related questions. Always remind users to consult healthcare professionals.",
            "finance": "You are a helpful assistant answering finance-related questions. Always include appropriate risk disclaimers.",
            "general": "You are a helpful assistant providing accurate and reliable information."
        }
        
        system_content = system_messages.get(domain, system_messages["general"])
        
        # Prepare request payload (OpenAI-compatible format)
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://watchdog-ai-safety.com",  # Optional: for rankings
            "X-Title": "WATCHDOG AI Safety System"  # Optional: for rankings
        }
        
        # Make async HTTP request
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.debug(f"Sending request to OpenRouter: model={self.model}")
            
            response = await client.post(
                self.openrouter_base_url,
                json=payload,
                headers=headers
            )
            
            # Handle HTTP errors
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"OpenRouter API error {response.status_code}: {error_detail}")
                
                if response.status_code == 401:
                    raise ValueError("Invalid OpenRouter API key")
                elif response.status_code == 429:
                    raise Exception("Rate limit exceeded - try again later")
                elif response.status_code >= 500:
                    raise Exception(f"OpenRouter server error: {response.status_code}")
                else:
                    raise Exception(f"API request failed: {response.status_code} - {error_detail}")
            
            # Parse response
            data = response.json()
            
            # Extract message content
            try:
                llm_response = data["choices"][0]["message"]["content"]
                logger.info(f"✓ OpenRouter response received ({len(llm_response)} chars)")
                return llm_response
            except (KeyError, IndexError) as e:
                logger.error(f"Unexpected response format: {data}")
                raise Exception(f"Invalid response structure from OpenRouter: {e}")

    async def _gemini_llm_call_with_retry(self, prompt: str, domain: str) -> str:
        """Call Google Gemini with retry logic"""
        last_error = None
        
        for attempt in range(self.max_retries + 1):
            try:
                if attempt > 0:
                    wait_time = 2 ** (attempt - 1)
                    logger.info(f"Retry attempt {attempt}/{self.max_retries} after {wait_time}s wait")
                    await asyncio.sleep(wait_time)
                
                return await self._gemini_llm_call(prompt, domain)
                
            except (httpx.TimeoutException, httpx.ConnectError, httpx.ReadError) as e:
                last_error = e
                logger.warning(f"Network error on attempt {attempt + 1}: {type(e).__name__}")
                continue
                
            except Exception as e:
                logger.error(f"Non-retryable error: {str(e)}")
                raise
        
        raise Exception(f"Gemini call failed after {self.max_retries + 1} attempts: {last_error}")

    async def _gemini_llm_call(self, prompt: str, domain: str) -> str:
        """Call Google Gemini API directly"""
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not set")
        
        # Build system instruction based on domain
        system_messages = {
            "health": "You are a helpful assistant answering health-related questions. Always remind users to consult healthcare professionals.",
            "finance": "You are a helpful assistant answering finance-related questions. Always include appropriate risk disclaimers.",
            "general": "You are a helpful assistant providing accurate and reliable information."
        }
        
        system_instruction = system_messages.get(domain, system_messages["general"])
        
        # Gemini API endpoint (v1)
        url = f"https://generativelanguage.googleapis.com/v1/models/{self.gemini_model}:generateContent?key={self.gemini_api_key}"
        
        # Prepare request payload
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"{system_instruction}\n\nUser: {prompt}"
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 500
            }
        }
        
        # Make async HTTP request
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.debug(f"Sending request to Gemini: model={self.gemini_model}")
            
            response = await client.post(url, json=payload)
            
            # Handle HTTP errors
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"Gemini API error {response.status_code}: {error_detail}")
                
                if response.status_code == 400:
                    raise ValueError(f"Invalid request to Gemini: {error_detail}")
                elif response.status_code == 429:
                    raise Exception("Rate limit exceeded - try again later")
                else:
                    raise Exception(f"API request failed: {response.status_code} - {error_detail}")
            
            # Parse response
            data = response.json()
            
            # Extract message content
            try:
                llm_response = data["candidates"][0]["content"]["parts"][0]["text"]
                logger.info(f"✓ Gemini response received ({len(llm_response)} chars)")
                return llm_response
            except (KeyError, IndexError) as e:
                logger.error(f"Unexpected Gemini response format: {data}")
                raise Exception(f"Invalid response structure from Gemini: {e}")


# ============================================
# SINGLETON INSTANCE
# ============================================

# Global proxy instance (initialized once)
llm_proxy = LLMProxy()


async def get_llm_response(prompt: str, domain: str = "general") -> str:
    """
    Convenience function for getting LLM responses
    
    Usage:
        response = await get_llm_response("What is AI?", domain="general")
    """
    return await llm_proxy.forward_prompt(prompt, domain)
