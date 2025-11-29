'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';

function GoogleCallbackContent() {
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/google/callback?code=${code}`, {
                    method: 'POST',
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to exchange code');
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

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
                </div>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
