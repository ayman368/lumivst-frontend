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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read env variable to enable/disable auth (default enabled)
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // When auth is disabled we treat the user as not logged in (null)
  useEffect(() => {
    if (!AUTH_ENABLED) {
      // No fake user – keep user as null so Logout button is hidden
      setUser(null);
      setLoading(false);
      return;
    }
    // Auth enabled – try to verify existing token
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    if (!AUTH_ENABLED) {
      console.log('🔓 Login skipped – auth disabled');
      return;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('فشل تسجيل الدخول');
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, fullName: string) => {
    if (!AUTH_ENABLED) {
      console.log('🔓 Register skipped – auth disabled');
      router.push('/dashboard');
      return;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!res.ok) throw new Error('فشل التسجيل');
    router.push('/login');
  };

  const logout = async () => {
    if (!AUTH_ENABLED) {
      console.log('🔓 Logout skipped – auth disabled');
      return;
    }
    const token = localStorage.getItem('token');
    if (token && user) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout?user_id=${user.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};