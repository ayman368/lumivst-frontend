"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth';

export default function PendingApproval() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [pendingUser, setPendingUser] = useState<any>(null);

    useEffect(() => {
        // Get pending info from localStorage
        const pendingMessage = localStorage.getItem('pendingApprovalMessage');
        if (pendingMessage) {
            setMessage(pendingMessage);
        }

        const pendingUserData = localStorage.getItem('pendingUser');
        if (pendingUserData) {
            try {
                setPendingUser(JSON.parse(pendingUserData));
            } catch (e) {
                console.error('Failed to parse pending user:', e);
            }
        }

        // Check status every 5 seconds
        const interval = setInterval(async () => {
            try {
                const tempToken = localStorage.getItem('tempToken');
                if (!tempToken || !pendingUser) {
                    console.log('No temp token or pending user available');
                    return;
                }

                // Try to check auth status using temp token
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${tempToken}`
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    if (user && user.is_approved) {
                        console.log('✅ User approved! Attempting to get fresh token...');
                        clearInterval(interval);
                        
                        // Try to refresh token
                        try {
                            const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/refresh-token`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${tempToken}`
                                }
                            });

                            if (refreshResponse.ok) {
                                const refreshData = await refreshResponse.json();
                                localStorage.setItem('token', refreshData.access_token);
                                document.cookie = `token=${refreshData.access_token}; path=/; max-age=2592000; SameSite=Lax`;
                                // Clear pending data
                                localStorage.removeItem('tempToken');
                                localStorage.removeItem('pendingUser');
                                localStorage.removeItem('pendingApprovalMessage');
                                // Redirect
                                window.location.href = '/';
                            }
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                            // Fallback: redirect to login
                            localStorage.removeItem('tempToken');
                            localStorage.removeItem('pendingUser');
                            router.push('/login');
                        }
                    }
                } else {
                    console.log('User not approved yet or token invalid');
                }
            } catch (error) {
                console.error('Check auth error:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="text-6xl mb-6">⏳</div>
                
                <h1 className="text-2xl font-bold mb-2 text-gray-900">الحساب قيد المراجعة</h1>
                <p className="text-gray-500 text-sm mb-6">Account Under Review</p>

                {pendingUser && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
                        <p className="text-gray-700 text-sm">
                            <strong>مرحباً {pendingUser.full_name || 'المستخدم'}</strong>
                            <br />
                            <br />
                            <span className="text-xs text-gray-600">البريد: {pendingUser.email}</span>
                        </p>
                    </div>
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                    <p className="text-gray-700 text-sm">
                        <strong>شكراً لتسجيلك!</strong>
                        <br />
                        <br />
                        حسابك جاهز لكن بحاجة لموافقة من الإدارة. 
                        سيتم تفعيل حسابك قريباً.
                        {message && (
                            <>
                                <br />
                                <br />
                                <span className="text-xs text-gray-600">({message})</span>
                            </>
                        )}
                    </p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-2" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-3">جاري التحقق من الحالة...</p>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('tempToken');
                        localStorage.removeItem('pendingUser');
                        localStorage.removeItem('pendingApprovalMessage');
                        router.push('/login');
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    تسجيل الخروج
                </button>

                <p className="text-xs text-gray-500 mt-4">
                    سيتم التحقق من الحالة كل 5 ثواني
                </p>
            </div>
        </div>
    );
}
