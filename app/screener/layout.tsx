import React from 'react';

export default function ScreenerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-slate-900 dark:bg-[#131722] dark:text-gray-100">
            {children}
        </div>
    );
}
