import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend may be offline');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend connection failed');
    } else if (error.response?.status === 401) {
      auth.signOut();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!error || typeof error !== 'object') return fallbackMessage;
  const err = error as { response?: { data?: { detail?: string | Array<{ msg?: string }> } } };
  const detail = err.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join(', ');
  }

  if (detail && typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return fallbackMessage;
}

export default apiClient;
