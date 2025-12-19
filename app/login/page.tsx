'use client';
import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import Link from 'next/link';
import { GoogleIcon, FacebookIcon } from '../_components/ui/SocialIcons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login`);
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error('Google login error:', error);
        alert('Failed to initialize Google Login');
      }
      return;
    }

    if (provider === 'Facebook') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/facebook/login`);
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error('Facebook login error:', error);
        alert('Failed to initialize Facebook Login');
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Header */}
        <div className="text-center relative">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Member Sign In</h1>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <FacebookIcon className="w-5 h-5" />
            <span>Sign in with Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="space-y-4 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Create free account
            </Link>
          </p>

          <div className="space-y-2 text-gray-500 text-xs">
            <p>
              By signing in using any of the options above, you agree to the{' '}
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Use</Link>
              {' '}&{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
            <p>
              Other issues? <a href="mailto:contactus@lumivst.com" className="text-blue-600 hover:underline">contactus@lumivst.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}