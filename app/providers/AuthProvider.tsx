'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  full_name: string;
  is_approved?: boolean;
  is_admin?: boolean;
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

import { API_ENDPOINTS } from '@/lib/api/config';

// Read env variable to enable/disable auth (default enabled)
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isPublicPath = (path: string) => {
    const publicPaths = [
      '/login',
      '/register',
      '/auth',
      '/pending-approval',
      '/terms',
      '/terms-of-service',
      '/privacy',
      '/privacy-policy',
      '/delete-account',
      '/about',
      '/contact',
    ];
    return publicPaths.some((p) => path === p || path.startsWith(`${p}/`));
  };

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
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.ME, {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        if (userData && userData.is_approved === false) {
          setUser(null);
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/pending-approval')) {
            router.push('/pending-approval');
          }
          return;
        }
        setUser(userData);
      } else if (res.status === 401) {
        // Access token expired or invalid, try to refresh
        try {
          const refreshRes = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { 
            method: 'POST', 
            headers: { 'x-csrf-token': '1' },
            credentials: 'include' 
          });
          
          if (refreshRes.ok) {
            // Successfully refreshed, check auth again
            const retryRes = await fetch(API_ENDPOINTS.AUTH.ME, { credentials: 'include' });
            if (retryRes.ok) {
              const userData = await retryRes.json();
              if (userData && userData.is_approved === false) {
                setUser(null);
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/pending-approval')) {
                  router.push('/pending-approval');
                }
                return;
              }
              setUser(userData);
              return; // Success after retry
            }
          }
        } catch (refreshErr) {
          console.warn("Failed to contact auth refresh endpoint", refreshErr);
        }
        
        // If we reach here, refresh failed or retry failed
        setUser(null);
        if (typeof window !== 'undefined' && !isPublicPath(window.location.pathname)) {
          window.location.href = '/login';
        }
      } else if (res.status === 403) {
        setUser(null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/pending-approval')) {
          router.push('/pending-approval');
        }
      }
    } catch (error) {
      // Network/transient issue (CSP block, CORS, offline, backend hot-reloading in dev)
      // Do NOT clear auth marker on network errors. If the backend is just restarting,
      // destroying the session forces the developer to constantly log back in.
      console.warn("Auth check encountered a network error or fetch was aborted:", error);
      // We do not set user to null or clear auth marker here to preserve the session
      // across hot reloads.
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!AUTH_ENABLED) {
      return;
    }

    const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': '1' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMessage = 'فشل تسجيل الدخول';
      let userData: any = null;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
        userData = errorData.user;
      } catch (e) {
        // If json parsing fails, use default message
      }

      // If 403 - account pending approval, redirect to pending page
      if (res.status === 403) {
        window.location.href = '/pending-approval';
        return;
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();
    if (data.user) {
      setUser(data.user);
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

    const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': '1' },
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

    window.location.href = '/pending-approval';
  };

  const logout = async () => {
    if (!AUTH_ENABLED) {
      return;
    }

    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: { 'x-csrf-token': '1' },
        credentials: 'include',
      });
    } catch {
      // Ignore logout network failure on client.
    }
    setUser(null);
    window.location.href = '/login';
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