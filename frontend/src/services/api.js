import axios from 'axios';



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cityroute_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Attach session ID for guest users
  let sessionId = localStorage.getItem('cityroute_session');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('cityroute_session', sessionId);
  }
  config.headers['x-session-id'] = sessionId;

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cityroute_token');
      localStorage.removeItem('cityroute_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Cities ───────────────────────────────────────────
export const citiesApi = {
  getAll: (params) => api.get('/cities', { params }),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

// ─── Locations ────────────────────────────────────────
export const locationsApi = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  autocomplete: (cityId, q) => api.get('/routes/autocomplete', { params: { cityId, q } }),
};

// ─── Routes ───────────────────────────────────────────
export const routesApi = {
  estimate: (data) => api.post('/routes/estimate', data),
  compare: (data) => api.post('/routes/compare', data),
};

// ─── Fares ────────────────────────────────────────────
export const faresApi = {
  getAll: (params) => api.get('/fares', { params }),
  getById: (id) => api.get(`/fares/${id}`),
  create: (data) => api.post('/fares', data),
  update: (id, data) => api.put(`/fares/${id}`, data),
  delete: (id) => api.delete(`/fares/${id}`),
};

// ─── History ──────────────────────────────────────────
export const historyApi = {
  getAll: (params) => api.get('/history', { params }),
  delete: (id) => api.delete(`/history/${id}`),
};

// ─── Profile ──────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
};

// ─── Admin ────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  cities: {
    getAll: (params) => api.get('/admin/cities', { params }),
    create: (data) => api.post('/admin/cities', data),
    update: (id, data) => api.put(`/admin/cities/${id}`, data),
    delete: (id) => api.delete(`/admin/cities/${id}`),
    toggle: (id) => api.put(`/admin/cities/${id}/toggle`),
  },
  fares: {
    getAll: (params) => api.get('/admin/fares', { params }),
    create: (data) => api.post('/admin/fares', data),
    update: (id, data) => api.put(`/admin/fares/${id}`, data),
    delete: (id) => api.delete(`/admin/fares/${id}`),
  },
  routes: {
    getAll: (params) => api.get('/admin/routes', { params }),
    create: (data) => api.post('/admin/routes', data),
    update: (id, data) => api.put(`/admin/routes/${id}`, data),
    delete: (id) => api.delete(`/admin/routes/${id}`),
  },
  auditLogs: () => api.get('/admin/audit-logs'),
};