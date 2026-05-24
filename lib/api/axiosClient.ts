import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { refreshSession } from './authFetch';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!config || error.response?.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    const url = config.url ?? '';
    if (
      url.includes('/api/auth/refresh-token') ||
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register')
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiClient(config);
    }
    return Promise.reject(error);
  }
);
