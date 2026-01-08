"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User } from '@/lib/services/auth';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const currentUser = await AuthService.checkAuth();

                if (!currentUser.is_approved) {
                    router.push('/pending-approval');
                    return;
                }

                if (requireAdmin && !currentUser.is_admin) {
                    router.push('/dashboard'); // or unauthorized
                    return;
                }

                setUser(currentUser);
                setLoading(false);
            } catch (error: any) {
                if (error.message === 'NOT_AUTHENTICATED' || error.message === 'SESSION_EXPIRED') {
                    router.push('/login');
                } else if (error.message === 'ACCOUNT_PENDING_APPROVAL') {
                    router.push('/pending-approval');
                } else {
                    // Fallback
                    router.push('/login');
                }
            }
        };

        checkAccess();
    }, [router, requireAdmin]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}
