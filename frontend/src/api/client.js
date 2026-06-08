import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  register: (email, password) => client.post('/auth/register', { email, password }),
  login: (email, password) => client.post('/auth/login', { email, password }),
  getMe: () => client.get('/auth/me'),
  getHistory: () => client.get('/auth/history'),
  saveSearch: (query) => client.post('/auth/saved', { query }),
  getSavedSearches: () => client.get('/auth/saved'),
};

export const bookmarkApi = {
  getAll: () => client.get('/bookmarks'),
  getIds: () => client.get('/bookmarks/ids'),
  add: (pageId) => client.post('/bookmarks', { pageId }),
  remove: (pageId) => client.delete(`/bookmarks/${pageId}`),
};

export default client;
