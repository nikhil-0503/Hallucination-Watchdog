/**
 * WATCHDOG API Service
 * Handles all communication between React frontend and FastAPI backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class WatchdogApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'WatchdogApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make authenticated API request
 */
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

/**
 * Analyze user prompt through WATCHDOG system
 */
export async function analyzePrompt(prompt, domain = 'general') {
  return apiRequest('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      domain,
    }),
  });
}

/**
 * Chat endpoint that handles role-based responses
 * - Users get safe response only
 * - Admins get full metadata
 */
export async function chatWithWatchdog(prompt, userRole = 'user', domain = 'general') {
  return apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      role: userRole,
      domain,
    }),
  });
}

/**
 * Get all prompt records (admin only)
 */
export async function getAllPrompts() {
  return apiRequest('/api/prompts', {
    method: 'GET',
  });
}

/**
 * Get single prompt by ID (admin only)
 */
export async function getPromptById(promptId) {
  return apiRequest(`/api/prompts/${promptId}`, {
    method: 'GET',
  });
}

/**
 * Get system health and metrics (admin only)
 */
export async function getSystemMetrics() {
  // Mock implementation - in real system this would be a backend endpoint
  return {
    totalPrompts: Math.floor(Math.random() * 10000) + 1000,
    blockedPrompts: Math.floor(Math.random() * 500) + 50,
    averageConfidence: Math.floor(Math.random() * 40) + 60,
    uptime: '99.7%',
    responseTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`
  };
}

/**
 * Get audit log of all prompts (admin only)  
 */
export async function getAuditLog() {
  // Mock implementation - in real system this would be a backend endpoint
  const mockPrompts = [];
  for (let i = 1; i <= 50; i++) {
    mockPrompts.push({
      id: i,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      user: `user${i}@company.com`,
      prompt: `Sample prompt ${i} asking about various topics...`,
      response: `Sample response ${i} with varying levels of safety...`,
      confidence: Math.floor(Math.random() * 100),
      status: ['Safe', 'Warning', 'Blocked'][Math.floor(Math.random() * 3)],
      flagged: Math.random() > 0.7,
      hallucinations: Math.floor(Math.random() * 3),
      processingTime: Math.random() * 3 + 0.5,
      ragStatus: ['Yes', 'Partial', 'No'][Math.floor(Math.random() * 3)],
      contradictionCheck: Math.random() > 0.3 ? 'Pass' : 'Fail'
    });
  }
  return mockPrompts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export { WatchdogApiError };