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
const baseURL = rawEnv.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({ baseURL });
// Bypass ngrok browser warning banner
api.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

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
  // Do not auto-remove token on 401; let the app decide.
  // This avoids redirect loops if a single endpoint returns 401 for non-admin.
    return Promise.reject(error);
  }
);
