"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth';

export default function PendingApproval() {
    const router = useRouter();

    useEffect(() => {
        // Check status every 10 seconds
        const interval = setInterval(async () => {
            try {
                const user = await AuthService.checkAuth();
                if (user.is_approved) {
                    clearInterval(interval);
                    // User is approved! Get a new token with updated claims.
                    try {
                        await AuthService.refreshToken();
                        // Token refreshed! Now redirect to home.
                        window.location.href = '/';
                    } catch (refreshError) {
                        console.error('Token refresh failed, falling back to logout', refreshError);
                        // Fallback: force re-login
                        AuthService.logout();
                    }
                }
            } catch (error) {
                console.error('Check error:', error);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-4xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold mb-4">الحساب قيد المراجعة</h1>
                <p className="mb-6 text-gray-600">
                    شكراً لتسجيلك. حسابك حالياً قيد المراجعة من قبل الإدارة.
                    <br />
                    سيتم تفعيل حسابك قريباً، يمكنك إبقاء هذه الصفحة مفتوحة.
                </p>

                <div className="animate-pulse flex justify-center mb-6">
                    <span className="text-sm text-blue-500">جاري التحقق من الحالة...</span>
                </div>

                <button
                    onClick={() => AuthService.logout()}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                    تسجيل الخروج
                </button>
            </div>
        </div>
    );
}
