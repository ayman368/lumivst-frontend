"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const eventSource = new EventSource(`${API_URL}/api/auth/pending-status/stream`, { withCredentials: true } as EventSourceInit);

        eventSource.onmessage = async (event) => {
            try {
                const payload = JSON.parse(event.data) as { approved?: boolean };
                if (payload.approved) {
                    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh-token`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                    if (refreshResponse.ok) {
                        localStorage.removeItem('pendingUser');
                        localStorage.removeItem('pendingApprovalMessage');
                        eventSource.close();
                        window.location.href = '/';
                    }
                }
            } catch {
                // Ignore malformed stream event.
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => eventSource.close();
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
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-2" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-3">جاري التحقق من الحالة...</p>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('pendingUser');
                        localStorage.removeItem('pendingApprovalMessage');
                        router.push('/login');
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    تسجيل الخروج
                </button>

                <p className="text-xs text-gray-500 mt-4">
                    سيتم التحقق من الحالة تلقائياً
                </p>
            </div>
        </div>
    );
}
