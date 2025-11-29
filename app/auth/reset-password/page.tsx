'use client';

import { useState, useEffect, Suspense } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setMessage({ type: 'error', text: 'Invalid or expired link' });
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (!token) {
            setMessage({ type: 'error', text: 'Missing verification token' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Something went wrong');
            }

            setMessage({ type: 'success', text: 'Password changed successfully' });
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center text-red-500 space-y-4">
                <p>Invalid link. Please request a new one.</p>
                <Link href="/auth/forget-password" className="text-black font-semibold hover:underline block">
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[400px] space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                <p className="text-gray-600 text-sm">Enter your new password below</p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm text-gray-600">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                            placeholder="Min. 8 characters"
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-sm text-gray-600">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Change Password'
                    )}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-black" /></div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

