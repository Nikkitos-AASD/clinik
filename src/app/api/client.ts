const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = {
  baseUrl: API_BASE_URL,

  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  },

  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  clearAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  buildUrl(path: string) {
    return `${API_BASE_URL}${path}`;
  },
};