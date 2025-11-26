import Link from 'next/link'
import { Mail, Globe, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">

          {/* Brand & Contact */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LUMIVST
            </h3>
            <p className="text-slate-400 text-sm">
              شركة لومي للاستثمار والتمويل الرقمي
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                info@lumivst.com
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Globe className="w-4 h-4" />
                www.lumivst.com
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                المنصورة، جمهورية مصر العربية
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/portfolios" className="hover:text-blue-400 transition-colors">Portfolios</Link></li>
              <li><Link href="/membership" className="hover:text-blue-400 transition-colors">Membership</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Market & Screeners */}
          <div>
            <h3 className="text-white font-semibold mb-4">Market & Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/market" className="hover:text-blue-400 transition-colors">Market Overview</Link></li>
              <li><Link href="/screeners" className="hover:text-blue-400 transition-colors">Stock Screeners</Link></li>
              <li><Link href="/screeners/technical" className="hover:text-blue-400 transition-colors">Technical Analysis</Link></li>
              <li><Link href="/market/saudi" className="hover:text-blue-400 transition-colors">Saudi Market</Link></li>
              <li><Link href="/market/us" className="hover:text-blue-400 transition-colors">US Market</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/news" className="hover:text-blue-400 transition-colors">News</Link></li>
              <li><Link href="/news/earnings" className="hover:text-blue-400 transition-colors">Earnings</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link href="/register" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 text-sm mb-2">
            © 2025 LUMI. جميع الحقوق محفوظة.
          </p>
          <p className="text-slate-600 text-xs">
            جميع خدماتنا الحالية هي خدمات استشارية وتسويقية وتعليمية وتحليلية، ولا نقدم أي خدمات مالية مرخصة حالياً.
          </p>
        </div>
      </div>
    </footer>
  )
}