"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in or token invalid
                const loginUrl = new URL('/login', window.location.href);
                loginUrl.searchParams.set('callbackUrl', pathname);
                router.push(loginUrl.pathname + loginUrl.search);
                return;
            }

            if (!user.is_approved) {
                router.push('/pending-approval');
                return;
            }

            if (requireAdmin && !user.is_admin) {
                router.push('/dashboard'); // or unauthorized
                return;
            }
        }
    }, [loading, user, router, requireAdmin, pathname]);

    if (loading || !user || !user.is_approved || (requireAdmin && !user.is_admin)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}
