import React, { useState } from 'react';

const TABS = ['Overview', 'Performance', 'Extended Hours', 'Valuation', 'Dividends', 'Profitability', 'Income Statement', 'Balance Sheet'];

export const ScreenerHeader: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    return (
        <div className="w-full bg-white dark:bg-[#131722] px-4 pt-4 border-b border-gray-200 dark:border-[#2a2e39]">

            {/* Title Area */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    Stock Screener
                    <span className="px-2 py-0.5 rounded text-[10px] font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">BETA</span>
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                whitespace-nowrap pb-3 text-sm font-semibold transition-colors border-b-2
                ${activeTab === tab
                                ? 'border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};
