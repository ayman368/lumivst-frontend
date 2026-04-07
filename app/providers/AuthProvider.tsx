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

  const setFrontendAuthMarker = (enabled: boolean) => {
    if (typeof document === 'undefined') return;
    if (enabled) {
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `frontend_auth=1; path=/; max-age=604800; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;
    } else {
      document.cookie = 'frontend_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        if (userData && userData.is_approved === false) {
          setUser(null);
          setFrontendAuthMarker(false);
          if (typeof window !== 'undefined' && window.location.pathname !== '/pending-approval') {
            router.push('/pending-approval');
          }
          return;
        }
        setUser(userData);
        setFrontendAuthMarker(true);
      } else if (res.status === 401) {
        setUser(null);
        setFrontendAuthMarker(false);
      } else if (res.status === 403) {
        setUser(null);
        setFrontendAuthMarker(false);
        if (typeof window !== 'undefined' && window.location.pathname !== '/pending-approval') {
          router.push('/pending-approval');
        }
      }
    } catch {
      // Network/transient issue; keep current state.
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!AUTH_ENABLED) {
      return;
    }

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

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
    if (data.user) {
      setUser(data.user);
      setFrontendAuthMarker(true);
    } else {
      await checkAuth();
    }

    window.location.href = '/';
  };

  const register = async (email: string, password: string, fullName?: string) => {
    if (!AUTH_ENABLED) {
      router.push('/');
      return;
    }

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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

    router.push('/pending-approval');
  };

  const logout = async () => {
    if (!AUTH_ENABLED) {
      return;
    }

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout network failure on client.
    }
    setUser(null);
    setFrontendAuthMarker(false);
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