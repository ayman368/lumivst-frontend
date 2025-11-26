'use client';

import { useState, useEffect, Suspense } from 'react';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('رابط التحقق مفقود');
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.detail || 'فشل التحقق من البريد الإلكتروني');
                }

                setStatus('success');
                setMessage('تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="text-center">
            {status === 'loading' && (
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-white">جاري التحقق من بريدك الإلكتروني...</h2>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center">
                    <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">تم التفعيل بنجاح!</h2>
                    <p className="text-slate-400 mb-8">{message}</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                    >
                        انتقل إلى تسجيل الدخول
                        <ArrowRight className="mr-2 h-5 w-5" />
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center">
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">فشل التحقق</h2>
                    <p className="text-slate-400 mb-8">{message}</p>
                    <Link
                        href="/login"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                        العودة إلى تسجيل الدخول
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
                <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-white" /></div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
