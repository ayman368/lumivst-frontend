import React, { useState, useEffect } from 'react';

export default function FilterAccordion({
    title,
    children,
    defaultOpen = false,
    collapseSignal = 0
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    collapseSignal?: number;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        if (collapseSignal > 0) {
            setIsOpen(false);
        }
    }, [collapseSignal]);

    return (
        <div className="border-b border-gray-200 pb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-2 text-xs font-semibold text-gray-700 hover:text-gray-900"
            >
                <span>{title}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen ? (
                <div className="mt-2 space-y-3">
                    {children}
                </div>
            ) : null}
        </div>
    );
}
