'use client';
import { useState } from 'react';
import { TrendingUp, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      // await register(email, password, fullName);
      setTimeout(() => setLoading(false), 1000);
    } catch (err) {
      setError('فشل إنشاء الحساب. ربما البريد مسجل بالفعل');
      setLoading(false);
    }
  };

  const passwordStrength = password.length > 0 ? (
    password.length < 6 ? 'ضعيفة' :
    password.length < 10 ? 'متوسطة' : 'قوية'
  ) : '';

  const strengthColor = 
    passwordStrength === 'ضعيفة' ? 'bg-red-500' :
    passwordStrength === 'متوسطة' ? 'bg-yellow-500' :
    'bg-green-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h1>
          <p className="text-gray-600">انضم إلينا وابدأ رحلتك الاستثمارية</p>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-11 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all placeholder:text-gray-400"
                  placeholder="أدخل اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-11 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all placeholder:text-gray-400"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-11 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{
                          width: password.length < 6 ? '33%' :
                                 password.length < 10 ? '66%' : '100%'
                        }}
                      ></div>
                    </div>
                    <span className={`text-xs font-semibold ${
                      passwordStrength === 'ضعيفة' ? 'text-red-600' :
                      passwordStrength === 'متوسطة' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    استخدم 10 أحرف على الأقل مع مزيج من الأحرف والأرقام
                  </p>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                أوافق على{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  الشروط والأحكام
                </a>
                {' '}و{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  سياسة الخصوصية
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  إنشاء حساب
                </>
              )}
            </button>
          </div>

          {/* Features List */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              {[
                'تحليلات مالية متقدمة',
                'متابعة المحفظة الاستثمارية',
                'تنبيهات فورية للأسواق'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-gray-600 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">أو</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-bold transition">
                سجل دخول
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>بياناتك آمنة ومحمية بأعلى معايير الأمان</p>
        </div>
      </div>
    </div>
  );
}