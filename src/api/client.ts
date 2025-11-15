// Vite environment type augmentation
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Access Vite env safely via any to avoid TS complains when not augmented.
import axios from 'axios';

const rawEnv = (import.meta as any).env || {};
const baseURL = rawEnv.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || error.response.statusText;
      console.warn('[api] 401 Unauthorized for', error.config?.url, 'message:', msg);
      // Only clear token if message explicitly indicates invalid/expired token
      if (/expired|invalid|token/i.test(msg)) {
        console.warn('[api] Clearing token due to invalid/expired message');
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);
