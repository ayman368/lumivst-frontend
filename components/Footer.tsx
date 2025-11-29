'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              LUMIVST
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              شريكك الذكي في عالم المال والأعمال. نقدم حلولاً مبتكرة تعتمد على الذكاء الاصطناعي لتعزيز قراراتك الاستثمارية.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">روابط سريعة</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  خدماتنا
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  المدونة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">خدماتنا</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  التحليل المالي الذكي
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  استشارات الأعمال
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  التسويق الرقمي
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  التكنولوجيا العقارية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">معلومات التواصل</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <span>القاهرة، مصر - التجمع الخامس</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span dir="ltr">+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>info@lumivst.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} LUMIVST. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}