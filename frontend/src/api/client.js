import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (import.meta.env.PROD && API_URL.includes('localhost')) {
  console.error(
    'VITE_API_URL is missing or points to localhost. Set it on Vercel to your Render URL + /api, then redeploy.'
  );
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    if (!error.response && error.message === 'Network Error') {
      const hint = import.meta.env.PROD && API_URL.includes('localhost')
        ? `Cannot reach API (still pointing at ${API_URL}). Set VITE_API_URL on Vercel to https://YOUR-APP.onrender.com/api and redeploy.`
        : `Cannot reach API at ${API_URL}. Check that Render is running and CORS_ORIGIN matches your Vercel URL.`;
      return Promise.reject(new Error(hint));
    }
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export function isRequestCanceled(error) {
  return (
    axios.isCancel(error) ||
    error?.name === 'CanceledError' ||
    error?.code === 'ERR_CANCELED' ||
    error?.message === 'canceled'
  );
}

export const searchApi = {
  search: (q, page = 1, fuzzy = false, signal) =>
    client.get('/search', { params: { q, page, fuzzy }, signal }),
  autocomplete: (q, signal) =>
    client.get('/search/autocomplete', { params: { q }, signal }),
};

export const crawlApi = {
  submit: (data) => client.post('/crawl/submit', data),
  getPages: (params) => client.get('/crawl/pages', { params }),
  getHistory: (limit = 50) => client.get('/crawl/history', { params: { limit } }),
};

export const analyticsApi = {
  getDashboard: () => client.get('/analytics/dashboard'),
  getSearchesOverTime: (days = 30) => client.get('/analytics/searches-over-time', { params: { days } }),
  getTopTerms: (limit = 10) => client.get('/analytics/top-terms', { params: { limit } }),
  getTopDocuments: (limit = 10) => client.get('/analytics/top-documents', { params: { limit } }),
  getErrors: (limit = 20) => client.get('/analytics/errors', { params: { limit } }),
};

export const authApi = {
  sendSignupOtp: (email) => client.post('/auth/signup/send-otp', { email }),
  verifySignupOtp: (email, code) => client.post('/auth/signup/verify', { email, code }),
  sendLoginOtp: (email) => client.post('/auth/login/send-otp', { email }),
  verifyLoginOtp: (email, code) => client.post('/auth/login/verify', { email, code }),
  getMe: () => client.get('/auth/me'),
  getHistory: () => client.get('/auth/history'),
  saveSearch: (query) => client.post('/auth/saved', { query }),
  getSavedSearches: () => client.get('/auth/saved'),
  deleteSavedSearch: (id) => client.delete(`/auth/saved/${id}`),
};

export const bookmarkApi = {
  getAll: () => client.get('/bookmarks'),
  getIds: () => client.get('/bookmarks/ids'),
  add: (pageId) => client.post('/bookmarks', { pageId }),
  remove: (pageId) => client.delete(`/bookmarks/${pageId}`),
};

export default client;
