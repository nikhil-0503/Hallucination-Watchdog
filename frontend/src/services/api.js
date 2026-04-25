/**
 * WATCHDOG API Service
 * Real-time communication between React frontend and FastAPI backend
 * No mock data — all endpoints call the live backend.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

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
      const errorData = await response.json().catch(() => null);
      throw new WatchdogApiError(
        errorData?.detail || `HTTP ${response.status}`,
        response.status,
        errorData
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
