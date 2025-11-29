'use client';
import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import Link from 'next/link';
import { GoogleIcon, FacebookIcon } from '../components/ui/SocialIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingViewProps {
  onEmailClick: () => void;
  onSocialLogin: (provider: string) => void;
}

const LandingView = ({ onEmailClick, onSocialLogin }: LandingViewProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full max-w-[400px] space-y-8"
  >
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
        Welcome to LUMIVST - <br />
        the world's largest provider of <br />
        investment analysis.
      </h1>
      <p className="text-gray-600 text-sm px-4">
        Join now for unlimited access to ad-free investing news, portfolio tracking, and real-time alerts
      </p>
    </div>

    <div className="space-y-3">
      <button
        onClick={onEmailClick}
        className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Create Free Account
      </button>

      <button
        onClick={() => onSocialLogin('Google')}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        <GoogleIcon className="w-5 h-5" />
        <span>Continue with Google</span>
      </button>

      <button
        onClick={() => onSocialLogin('Facebook')}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        <FacebookIcon className="w-5 h-5" />
        <span>Continue with Facebook</span>
      </button>
    </div>

    <div className="text-center">
      <Link href="/login" className="text-blue-600 font-medium hover:underline">
        Sign in with email
      </Link>
    </div>

    <div className="text-center text-xs text-gray-500 px-4">
      <p>
        By creating an account using any of the options above, you agree to the{' '}
        <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Use</Link>
        {' '}&{' '}
        <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
      </p>
    </div>
  </motion.div>
);

interface EmailFormViewProps {
  onBack: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string;
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
}

const EmailFormView = ({
  onBack,
  onSubmit,
  loading,
  error,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword
}: EmailFormViewProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full max-w-[400px] space-y-6"
  >
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>
      <h1 className="text-xl font-bold text-gray-900">Create Free Account</h1>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm text-gray-600">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-gray-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          placeholder="example@email.com"
          required
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
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 py-2">
        <input
          type="checkbox"
          id="terms"
          className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          required
        />
        <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
          I agree to the{' '}
          <Link href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Use</Link>
          {' '}and{' '}
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  </motion.div>
);

export default function RegisterPage() {
  const [view, setView] = useState<'landing' | 'email-form'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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

    console.log(`Register with ${provider}`);
    alert(`Register with ${provider} is coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Chart Effect (Subtle) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
          <path fill="#f97316" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Logo (Optional, if needed above) */}
      <div className="absolute top-8 left-0 right-0 flex justify-center">
        {/* <span className="text-2xl font-bold text-orange-600">LUMIVST</span> */}
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <LandingView
            key="landing"
            onEmailClick={() => setView('email-form')}
            onSocialLogin={handleSocialLogin}
          />
        ) : (
          <EmailFormView
            key="email-form"
            onBack={() => setView('landing')}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        )}
      </AnimatePresence>
    </div>
  );
}