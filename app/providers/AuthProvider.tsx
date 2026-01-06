'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Read env variable to enable/disable auth (default enabled)
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log('🔄 AuthProvider render, user:', user?.email || 'null', 'loading:', loading);

  // When auth is disabled we treat the user as not logged in (null)
  useEffect(() => {
    if (!AUTH_ENABLED) {
      setUser(null);
      setLoading(false);
      return;
    }
    // Auth enabled – try to verify existing token
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking auth with token:', token ? 'Present' : 'Missing');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('🔍 Auth check response:', res.status);

      if (res.ok) {
        const userData = await res.json();
        console.log('✅ User authenticated:', userData.email);
        setUser(userData);
        // Refresh cookie
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;
      } else {
        // Only log out if explicitly unauthorized (401)
        if (res.status === 401) {
          console.warn('⚠️ Auth check failed (401), removing token');
          localStorage.removeItem('token');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setUser(null);
        } else {
          console.warn(`⚠️ Auth check returned ${res.status}, keeping token for now.`);
          // Optionally we might want to keep the user as null but NOT clear the token,
          // or assume they are logged in if we trust the token (risky).
          // For now, let's NOT clear the token, allowing retry.
        }
      }
    } catch (e) {
      console.error('❌ Auth check error:', e);
      // Network error? Do NOT log out.
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    if (!AUTH_ENABLED) {
      console.log('🔓 Login skipped – auth disabled');
      return;
    }

    console.log('🔄 Attempting login...');
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 404) {
      throw new Error('NOT_FOUND');
    }

    if (!res.ok) {
      let errorMessage = 'فشل تسجيل الدخول';
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If json parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    // Set cookie for middleware
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;

    console.log('✅ Login successful, setting user data...');

    // Backend returns user object in login response
    if (data.user) {
      setUser(data.user);
      console.log('✅ User state updated:', data.user.full_name || data.user.email);
    } else {
      // Fallback if backend doesn't return user
      await checkAuth();
    }

    // Navigate to home using router for smoother transition, but ensure state is robust
    console.log('🔄 Navigating to home...');
    if (window.location.pathname !== '/') {
      router.push('/');
      router.refresh();
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    if (!AUTH_ENABLED) {
      console.log('🔓 Register skipped – auth disabled');
      router.push('/');
      return;
    }

    console.log('🔄 Attempting registration...');
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName || '' }),
    });

    if (!res.ok) {
      let errorMessage = 'فشل التسجيل';
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If json parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    console.log('✅ Registration successful, logging in...');
    const data = await res.json();
    // data contains access_token
    localStorage.setItem('token', data.access_token);
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;

    // Fetch user data to update state
    await checkAuth();

    if (window.location.pathname !== '/') {
      router.push('/');
      router.refresh();
    }
  };

  const logout = async () => {
    if (!AUTH_ENABLED) {
      console.log('🔓 Logout skipped – auth disabled');
      return;
    }
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        await fetch(`${API_URL}/api/auth/logout?user_id=${user.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};