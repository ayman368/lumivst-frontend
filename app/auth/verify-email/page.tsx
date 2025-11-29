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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/verify-email?token=${token}`);
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
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">جاري التحقق من بريدك الإلكتروني...</h2>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center">
                    <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">تم التفعيل بنجاح!</h2>
                    <p className="text-gray-600 mb-8">{message}</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30"
                    >
                        انتقل إلى تسجيل الدخول
                        <ArrowRight className="mr-2 h-5 w-5" />
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center">
                    <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">فشل التحقق</h2>
                    <p className="text-gray-600 mb-8">{message}</p>
                    <Link
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
                <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
