/**
 * Competitive Intern — Core API Client
 * Configurable via VITE_API_URL with graceful fallback handling.
 */

export const API_URL = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'));

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');
const API_PREFIX = BASE_URL ? `${BASE_URL}/api/v1` : '/api/v1';

/**
 * Robust fetch wrapper with timeout and json parsing.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('API Request timed out after 6 seconds');
    }
    throw err;
  }
}

/**
 * Health check endpoint verifying backend and database connection.
 */
export async function checkBackendHealth(): Promise<{ status: string; service: string; database?: string }> {
  return fetchApi<{ status: string; service: string; database?: string }>('/health');
}

/**
 * Legacy & Compatibility API Service Object
 */
async function handleResponse(response: Response) {
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
    try {
      const res = await fetch(`${API_URL}/health`);
      return handleResponse(res);
    } catch {
      const res = await fetch(`${API_PREFIX}/health`);
      return handleResponse(res);
    }
  },

  // Competitor CRUD
  getCompetitors: async (page = 1, pageSize = 100) => {
    try {
      return await fetchApi<any[]>('/competitors');
    } catch {
      const res = await fetch(`${API_PREFIX}/competitors?page=${page}&page_size=${pageSize}`);
      return handleResponse(res);
    }
  },

  getCompetitor: async (id: number | string) => {
    try {
      return await fetchApi<any>(`/competitors/${id}`);
    } catch {
      const res = await fetch(`${API_PREFIX}/competitors/${id}`);
      return handleResponse(res);
    }
  },

  createCompetitor: async (payload: any) => {
    return await fetchApi<any>('/competitors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCompetitor: async (id: number | string, payload: any) => {
    return await fetchApi<any>(`/competitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCompetitor: async (id: number | string) => {
    return await fetchApi<any>(`/competitors/${id}`, {
      method: 'DELETE',
    });
  },

  // Events CRUD
  getAllEvents: async (params: any = {}) => {
    return await fetchApi<any[]>('/activities');
  },

  getCompetitorEvents: async (competitorId: number | string) => {
    return await fetchApi<any[]>(`/competitors/${competitorId}/activities`);
  },

  getEvent: async (eventId: number | string) => {
    return await fetchApi<any>(`/activities/${eventId}`);
  },

  createEvent: async (competitorId: number | string, payload: any) => {
    return await fetchApi<any>('/activities', {
      method: 'POST',
      body: JSON.stringify({ ...payload, competitor_id: competitorId }),
    });
  },

  // Recall / Chat
  queryRecall: async (payload: any) => {
    return await fetchApi<any>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  analyzeIntelligence: async (payload: any) => {
    return await fetchApi<any>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
