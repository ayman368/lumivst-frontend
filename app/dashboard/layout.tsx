'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileSpreadsheet, FolderOpen, Upload, BarChart3, Home, ArrowLeft } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard/financials', label: 'Financials', labelAr: 'البيانات المالية', icon: FileSpreadsheet },
        { href: '/dashboard/reports', label: 'Excel Reports', labelAr: 'ملفات Excel', icon: FolderOpen },
        { href: '/dashboard/upload', label: 'Upload', labelAr: 'رفع ملف', icon: Upload },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navigation - Hidden on Financials Page */}
            {!pathname?.includes('/dashboard/financials') && (
                <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
                    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo & Back */}
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="text-sm">Back to App</span>
                                </Link>
                                <div className="h-6 w-px bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-blue-400" />
                                    <span className="font-bold text-lg">Scraper Dashboard</span>
                                </div>
                            </div>

                            {/* Nav Items */}
                            <div className="flex items-center gap-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                            ${isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                                }
                                        `}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    );
}
