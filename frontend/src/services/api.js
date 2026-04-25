/**
 * WATCHDOG API Service
 * Real-time communication between React frontend and FastAPI backend
 * No mock data — all endpoints call the live backend.
 */

function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  // Accept both forms:
  // - https://backend.railway.app
  // - https://backend.railway.app/api
  return trimmed.replace(/\/api$/i, '');
}

function resolveApiBaseUrl() {
  // In production, prefer same-origin API calls and let frontend/server.js
  // proxy /api/* to BACKEND_URL. This avoids browser CORS issues.
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return normalizeApiBaseUrl(process.env.REACT_APP_API_URL || '');
}

const API_BASE_URL = resolveApiBaseUrl();

// Health check cache to avoid excessive requests
let healthCheckCache = {
  status: null,
  timestamp: 0,
};

export async function checkBackendHealth() {
  const now = Date.now();
  
  // Return cached result if recent (within 5 seconds)
  if (healthCheckCache.status !== null && now - healthCheckCache.timestamp < 5000) {
    return healthCheckCache.status;
  }

  try {
    if (!API_BASE_URL) {
      return { healthy: false, message: 'API_BASE_URL not configured' };
    }

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 3000 
    });
    const healthy = response.ok;
    const result = { healthy, message: healthy ? 'Backend is reachable' : 'Backend returned error' };
    
    healthCheckCache = { status: result, timestamp: now };
    return result;
  } catch (error) {
    const result = { healthy: false, message: `Cannot reach backend: ${error.message}` };
    healthCheckCache = { status: result, timestamp: now };
    return result;
  }
}

class WatchdogApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'WatchdogApiError';
    this.status = status;
    this.data = data;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to parse as JSON, but handle HTML error pages gracefully
      let errorData = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      const message = errorData?.detail || `HTTP ${response.status}`;
      throw new WatchdogApiError(message, response.status, errorData);
    }

    const contentType = response.headers.get('content-type');
    
    // Verify we got JSON, not HTML
    if (!contentType || !contentType.includes('application/json')) {
      throw new WatchdogApiError(
        `Server returned invalid content type: ${contentType || 'unknown'}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof WatchdogApiError) {
      throw error;
    }
    throw new WatchdogApiError(`Network error: ${error.message}`, 0);
  }
}

export async function analyzePrompt(prompt, domain = 'general') {
  return apiRequest('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ prompt, domain }),
  });
}

export async function chatWithWatchdog(prompt, userRole = 'user', domain = 'general') {
  return apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, role: userRole, domain }),
  });
}

export async function getAllPrompts() {
  return apiRequest('/api/prompts', { method: 'GET' });
}

export async function getPromptById(promptId) {
  return apiRequest(`/api/prompts/${promptId}`, { method: 'GET' });
}

export async function getDashboardStats() {
  return apiRequest('/api/stats', { method: 'GET' });
}

export async function getImpactMetrics() {
  return apiRequest('/api/impact-metrics', { method: 'GET' });
}

export async function getLatestExplainability() {
  return apiRequest('/api/explainability/latest', { method: 'GET' });
}

export async function getWhatIfState() {
  return apiRequest('/api/what-if-state', { method: 'GET' });
}

export async function getCommunityPatterns() {
  return apiRequest('/api/community-patterns', { method: 'GET' });
}

export async function analyzeBias(decision, historicalDecisions = null, outcomeField = 'decision') {
  return apiRequest('/api/analyze-bias', {
    method: 'POST',
    body: JSON.stringify({ decision, historical_decisions: historicalDecisions, outcome_field: outcomeField }),
  });
}

export async function auditDataset(decisions, outcomeField = 'decision') {
  return apiRequest('/api/audit-dataset', {
    method: 'POST',
    body: JSON.stringify({ decisions, outcome_field: outcomeField }),
  });
}

export { WatchdogApiError };
