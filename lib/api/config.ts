export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    ME: `${API_BASE_URL}/api/auth/me`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
    ACTIVATE_SESSION: `${API_BASE_URL}/api/auth/activate-session`,
    PENDING_STATUS_CHECK: `${API_BASE_URL}/api/auth/pending-status/check`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forget-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google/login`,
    FACEBOOK_LOGIN: `${API_BASE_URL}/api/auth/facebook/login`,
  },
  ADMIN: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  }
};
