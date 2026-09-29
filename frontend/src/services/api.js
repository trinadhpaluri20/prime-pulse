const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_PREFIX = `${BASE_URL}/api/v1`;

function getAuthHeaders() {
  const token = localStorage.getItem('ci_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null;
  }
  return await response.json();
}

export const apiService = {
  // Health Telemetry
  getHealth: async () => {
    const res = await fetch(`${API_PREFIX}/health`);
    return handleResponse(res);
  },

  // Competitor CRUD
  getCompetitors: async (page = 1, pageSize = 100) => {
    const res = await fetch(`${API_PREFIX}/competitors?page=${page}&page_size=${pageSize}`);
    return handleResponse(res);
  },

  getCompetitor: async (id) => {
    const res = await fetch(`${API_PREFIX}/competitors/${id}`);
    return handleResponse(res);
  },

  createCompetitor: async (payload) => {
    const res = await fetch(`${API_PREFIX}/competitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  updateCompetitor: async (id, payload) => {
    const res = await fetch(`${API_PREFIX}/competitors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  deleteCompetitor: async (id) => {
    const res = await fetch(`${API_PREFIX}/competitors/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Events CRUD & Dual Persistence
  createEvent: async (competitorId, payload) => {
    const res = await fetch(`${API_PREFIX}/competitors/${competitorId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  getCompetitorEvents: async (competitorId, page = 1, pageSize = 100) => {
    const res = await fetch(`${API_PREFIX}/competitors/${competitorId}/events?page=${page}&page_size=${pageSize}`);
    return handleResponse(res);
  },

  getEvent: async (eventId) => {
    const res = await fetch(`${API_PREFIX}/events/${eventId}`);
    return handleResponse(res);
  },

  updateEvent: async (eventId, payload) => {
    const res = await fetch(`${API_PREFIX}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  deleteEvent: async (eventId) => {
    const res = await fetch(`${API_PREFIX}/events/${eventId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Recall Engine & Timeline
  queryRecall: async (payload) => {
    const res = await fetch(`${API_PREFIX}/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  getCompetitorHistory: async (competitorId, category = null, limit = 100) => {
    let url = `${API_PREFIX}/competitors/${competitorId}/history?limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    const res = await fetch(url);
    return handleResponse(res);
  },

  // Gemini AI Agent Orchestration
  analyzeIntelligence: async (payload) => {
    const res = await fetch(`${API_PREFIX}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Dev Memory Test Endpoints
  testMemoryRetain: async (content, context = 'dev_test') => {
    const res = await fetch(`${API_PREFIX}/memory/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, context }),
    });
    return handleResponse(res);
  },

  testMemoryRecall: async (query) => {
    const res = await fetch(`${API_PREFIX}/memory/test/recall?q=${encodeURIComponent(query)}`);
    return handleResponse(res);
  },
};
