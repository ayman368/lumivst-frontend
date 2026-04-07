import axios from 'axios';

const API_URL_RAW = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Ensure API_URL always has /api suffix
const API_URL = API_URL_RAW.endsWith('/api') ? API_URL_RAW : `${API_URL_RAW}/api`;

export interface User {
    id: number;
    email: string;
    full_name: string;
    is_verified: boolean;
    is_approved: boolean;
    is_admin: boolean;
}

export interface AuthResponse {
    access_token?: string;
    token_type?: string;
    user?: User;
    message?: string;
}

export const AuthService = {
    async login(email: string, password: string): Promise<User> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
                email,
                password
            }, {
                withCredentials: true
            });
            if (!response.data?.user) {
                throw new Error('Login response missing user data');
            }
            return response.data.user;
        } catch (error: any) {
            if (error.response?.status === 403) {
                // If it's a 403, it might be unapproved. We still throw but can handle format.
                if (error.response.data.detail && (
                    error.response.data.detail.includes("approval") ||
                    error.response.data.detail.includes("موافقة")
                )) {
                    throw new Error("ACCOUNT_PENDING_APPROVAL");
                }
            }
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    },

    async register(data: any): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data, {
                withCredentials: true
            });
            return response.data || {};
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    },

    logout() {
        window.location.href = '/login';
    },

    async checkAuth(): Promise<User> {
        try {
            const response = await axios.get<User>(`${API_URL}/auth/me`, {
                withCredentials: true
            });
            return response.data;
        } catch (error: any) {
            console.error("Auth check failed:", error.response?.status, error.message);
            // Cookies.remove('session_token'); // Don't remove immediately to debug
            throw new Error("SESSION_EXPIRED");
        }
    },

    async refreshToken(): Promise<User> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh-token`, {}, {
                withCredentials: true
            });
            if (!response.data?.user) {
                throw new Error("TOKEN_REFRESH_FAILED");
            }
            return response.data.user;
        } catch (error: any) {
            console.error("Token refresh failed:", error.response?.status, error.message);
            throw new Error("TOKEN_REFRESH_FAILED");
        }
    },

    async getToken(): Promise<string | null> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh-token`, {}, {
                withCredentials: true
            });
            return response.data?.access_token || null;
        } catch {
            return null;
        }
    }
};
