'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';

function FacebookCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setError('No authorization code found');
            return;
        }

        const exchangeCode = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/facebook/callback?code=${code}`, {
                    method: 'POST',
                });

                if (!res.ok) {
                    let errorMessage = 'Failed to exchange code';
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData.detail || errorData.message || 'Failed to exchange code';
                    } catch (parseError) {
                        console.error('Failed to parse error response:', parseError);
                    }
                    console.error(`[Facebook Callback] Status ${res.status}: ${errorMessage}`);
                    
                    // If approval pending, redirect to pending page
                    if (res.status === 403 && errorMessage.includes('بانتظار موافقة')) {
                        router.push(`/pending-approval`);
                        return;
                    }
                    
                    throw new Error(errorMessage);
                }

                const data = await res.json();

                // Store token
                localStorage.setItem('token', data.access_token);
                document.cookie = `token=${data.access_token}; path=/; max-age=2592000; SameSite=Lax`;

                // Update user state
                setUser(data.user);

                // Redirect to dashboard
                router.push('/');
            } catch (err: any) {
                console.error('[Facebook Callback] Error:', err);
                setError(err.message);
            }
        };

        exchangeCode();
    }, [searchParams, router, setUser]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h1>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold text-gray-900">Completing Secure Login...</h1>
            </div>
        </div>
    );
}

export default function FacebookCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
                </div>
            </div>
        }>
            <FacebookCallbackContent />
        </Suspense>
    );
}
