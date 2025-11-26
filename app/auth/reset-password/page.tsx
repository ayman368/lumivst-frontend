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
            setMessage({ type: 'error', text: 'رابط غير صالح أو منتهي الصلاحية' });
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' });
            return;
        }

        if (!token) {
            setMessage({ type: 'error', text: 'رمز التحقق مفقود' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'حدث خطأ ما');
            }

            setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
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
            <div className="text-center text-red-400">
                <p>رابط غير صالح. يرجى طلب رابط جديد.</p>
                <Link href="/auth/forget-password" className="text-blue-400 hover:underline mt-4 block">
                    طلب رابط جديد
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">تعيين كلمة المرور</h1>
                <p className="text-slate-400">أدخل كلمة المرور الجديدة لحسابك</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' && <CheckCircle className="inline-block w-4 h-4 ml-2" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-300">
                        كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pr-10 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                        تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pr-10 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'تغيير كلمة المرور'
                    )}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
                <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-white" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
