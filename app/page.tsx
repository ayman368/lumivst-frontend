'use client';

import { ArrowRight, TrendingUp, Building2, Brain, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-100 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-100 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                LUMIVST
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-light">
                مستقبل التكنولوجيا المالية الذكية
              </p>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              حلول مالية ذكية تعتمد على
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                الذكاء الاصطناعي
              </span>
            </h2>

            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              نحن نؤمن أن المستقبل المالي يبدأ من المعرفة والتحليل الذكي. نقدم حلول رقمية مبتكرة في مجالات التحليل الاقتصادي، التسويق الرقمي، وتطوير الأعمال.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-2"
              >
                ابدأ الآن
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#services"
                className="px-8 py-4 bg-white text-slate-700 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all duration-300 border border-slate-200 shadow-sm"
              >
                اكتشف خدماتنا
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              لماذا تختار لومي؟
            </h2>
            <p className="text-xl text-slate-600">
              نجمع بين الابتكار التقني والخبرة الاستثمارية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12" />,
                title: "تحليل ذكي متقدم",
                description: "أدوات تحليل مالي تعتمد على الذكاء الاصطناعي والخوارزميات المتقدمة لدعم قراراتك الاستثمارية"
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "استشارات احترافية",
                description: "فريق من الخبراء يقدم استشارات اقتصادية ودراسات جدوى شاملة لمشروعاتك"
              },
              {
                icon: <Building2 className="w-12 h-12" />,
                title: "تكنولوجيا عقارية",
                description: "منصات PropTech متطورة لتحليل السوق العقاري وتقييم العقارات بدقة عالية"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              خدماتنا المتكاملة
            </h2>
            <p className="text-xl text-slate-600">
              حلول شاملة لتلبية احتياجاتك المالية والتقنية
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "التكنولوجيا المالية والتحليل الذكي",
                items: [
                  "منصات تحليل مالي ذكية",
                  "أدوات دعم القرار الاستثماري",
                  "تحليل البيانات الضخمة",
                  "منصات تداول افتراضي تدريبي"
                ]
              },
              {
                title: "التكنولوجيا العقارية PropTech",
                items: [
                  "منصات عرض البيانات العقارية",
                  "تقييم العقارات الذكي",
                  "مقارنة الأسعار والمؤشرات",
                  "تقارير أداء سوقية متقدمة"
                ]
              },
              {
                title: "الاستشارات الاقتصادية",
                items: [
                  "دراسات الجدوى الاقتصادية",
                  "تحليل الأسواق والقطاعات",
                  "محتوى تثقيفي مالي",
                  "استشارات المشروعات الريادية"
                ]
              },
              {
                title: "التسويق الرقمي",
                items: [
                  "حملات تسويقية رقمية",
                  "إدارة وسائل التواصل",
                  "تحليل البيانات التسويقية",
                  "بناء الهوية البصرية"
                ]
              }
            ].map((service, index) => (
              <div
                key={index}
                className="p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-500/50 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  {service.title}
                </h3>
                <ul className="space-y-3">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
              <div className="text-blue-600 mb-4">
                <TrendingUp className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">رؤيتنا</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                أن نكون مستقبل التكنولوجيا المالية الذكية (Smart Fintech) في مصر والمنطقة العربية، عبر تقديم حلول رقمية مبتكرة تعتمد على الذكاء الاصطناعي، مع الحفاظ على مكانتنا كشريك موثوق في الاستثمارات والتحليل والتسويق.
              </p>
            </div>

            <div className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
              <div className="text-purple-600 mb-4">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">رسالتنا</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                نحن نؤمن أن المستقبل المالي يبدأ من المعرفة والتحليل الذكي. نعمل عبر أدوات التكنولوجيا الحديثة لتعزيز أعمالكم بفعالية، ونقدم خدمات استشارية وتسويقية احترافية ضمن الإطار القانوني.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            انضم إلى مستقبل التكنولوجيا المالية الذكية اليوم
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
          >
            ابدأ رحلتك معنا
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}