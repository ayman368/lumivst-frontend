'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    password: password  // Note: Backend expects 'password', not 'new_password' based on schema usually
                })
            });

            if (res.ok) {
                alert('Password changed successfully!');
                router.push('/login');
            } else {
                const data = await res.json();
                alert(data.detail || 'Invalid or expired token');
            }
        } catch (e) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return (
        <div className="text-center text-red-600 font-medium">
            Invalid or missing token.
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-1">
                <label className="block text-sm text-gray-600">New Password</label>
                <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
            </div>
            <button
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
                    <p className="text-gray-500">Please enter your new password below</p>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
