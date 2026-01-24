import axios from 'axios';
import Cookies from 'js-cookie';

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
    access_token: string;
    token_type: string;
    user: User;
}

export const AuthService = {
    async login(email: string, password: string): Promise<User> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
                email,
                password
            });

            // Save token to cookie for Middleware
            Cookies.set('session_token', response.data.access_token, { expires: 7 }); // 7 days
            // Also save to localStorage for AuthProvider
            localStorage.setItem('token', response.data.access_token);
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

    async register(data: any): Promise<void> {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, data);
            Cookies.set('session_token', response.data.access_token, { expires: 7 });
            localStorage.setItem('token', response.data.access_token);
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    },

    logout() {
        Cookies.remove('session_token');
        localStorage.removeItem('token');
        window.location.href = '/login';
    },

    async checkAuth(): Promise<User> {
        const token = Cookies.get('session_token');
        if (!token) throw new Error("NOT_AUTHENTICATED");

        try {
            const response = await axios.get<User>(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            console.error("Auth check failed:", error.response?.status, error.message);
            // Cookies.remove('session_token'); // Don't remove immediately to debug
            throw new Error("SESSION_EXPIRED");
        }
    },

    async refreshToken(): Promise<User> {
        const token = Cookies.get('session_token');
        if (!token) throw new Error("NOT_AUTHENTICATED");

        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh-token`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Save new token to BOTH cookie AND localStorage
            Cookies.set('session_token', response.data.access_token, { expires: 7 });
            localStorage.setItem('token', response.data.access_token);
            return response.data.user;
        } catch (error: any) {
            console.error("Token refresh failed:", error.response?.status, error.message);
            throw new Error("TOKEN_REFRESH_FAILED");
        }
    },

    getToken() {
        return Cookies.get('session_token');
    }
};
