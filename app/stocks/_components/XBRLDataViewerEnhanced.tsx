"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, AlertCircle, Menu, BarChart3, Search, X, TrendingUp } from 'lucide-react';

interface MetricRecord {
    key: string;
    label: string;
    value: string | number | null;
    text?: string;
}

interface MetricsBySection {
    [section: string]: MetricRecord[];
}

interface XBRLDataViewerEnhancedProps {
    symbol: string;
}

const getSectionTitle = (section: string): string => {
    return section
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getSectionIcon = (section: string): React.ReactNode => {
    const icons: Record<string, string> = {
        income_statement: '📈',
        balance_sheet: '🏦',
        cash_flow: '💵',
        ratios: '📊',
        segments: '🔷',
        notes: '📋',
    };
    const key = Object.keys(icons).find(k => section.toLowerCase().includes(k.replace('_', '')));
    return <span>{key ? icons[key] : '📁'}</span>;
};

export default function XBRLDataViewerEnhanced({ symbol }: XBRLDataViewerEnhancedProps) {
    const [data, setData] = useState<Record<string, MetricsBySection> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [periodDisplayMode, setPeriodDisplayMode] = useState<'all' | 'annual' | 'quarterly'>('all');

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const dataRes = await fetch(`${API_URL}/api/financial-metrics/${symbol}/data-by-section`);
                if (!dataRes.ok) throw new Error("Failed to fetch financial data");
                const jsonData = await dataRes.json();
                setData(jsonData);
            } catch (err) {
                console.error(err);
                setError("No detailed data available for this company yet.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [symbol]);

    useEffect(() => {
        if (data && !selectedSection) {
            // Get all sections across all periods
            const allSections = new Set<string>();
            Object.values(data).forEach(periodData => {
                Object.keys(periodData).forEach(sec => allSections.add(sec));
            });
            const sections = Array.from(allSections).sort();
            if (sections.length > 0) setSelectedSection(sections[0]);
        }
    }, [data, selectedSection]);

    const fmt = (val: any) => {
        if (val === null || val === undefined || val === "") return "—";
        if (typeof val === 'number') {
            // Format numbers nicely, adding commas
            return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        if (!isNaN(Number(val)) && val.toString().length > 4) {
            return Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return val;
    };

    const isPositiveValue = (val: any): boolean | null => {
        if (val === null || val === undefined || val === "") return null;
        const num = typeof val === 'number' ? val : Number(val);
        if (isNaN(num)) return null;
        return num >= 0;
    };

    if (loading) return (
        <div className="flex h-[600px] items-center justify-center bg-[#070B14] rounded-3xl border border-gray-800/60 shadow-2xl">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-[3px] border-[#1e2d4a]/40 flex items-center justify-center">
                        <div className="absolute w-full h-full rounded-full border-[3px] border-transparent border-t-[#3b82f6] animate-[spin_1s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite]" />
                        <BarChart3 className="w-8 h-8 text-[#3b82f6] opacity-80" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-200 font-bold tracking-[0.2em] text-sm uppercase">Loading Financial Data</p>
                    <p className="text-[#3b82f6] text-xs mt-1.5 tracking-widest font-mono">{symbol}</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-4 p-6 bg-[#0f172a] border border-red-500/20 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-20">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
                <p className="text-red-400 font-bold text-base tracking-wide">Data Unavailable</p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{error}</p>
            </div>
        </div>
    );

    if (!data) return null;

    // Aggregate periods and sections
    let periods = Object.keys(data).sort((a, b) => {
        // Simple sort descending by year. The key looks like "2024 ANNUAL::source"
        return b.localeCompare(a);
    });

    if (periodDisplayMode === 'annual') {
        periods = periods.filter(p => p.toLowerCase().includes('annual') || p.toLowerCase().includes('year'));
    } else if (periodDisplayMode === 'quarterly') {
        // Assume anything that isn't annual/year is quarterly (e.g., Q1, Q2, Q3, 9M, 6M)
        periods = periods.filter(p => !p.toLowerCase().includes('annual') && !p.toLowerCase().includes('year'));
    }

    const allSections = new Set<string>();
    Object.values(data).forEach(periodData => {
        Object.keys(periodData).forEach(sec => allSections.add(sec));
    });
    const sections = Array.from(allSections).sort();

    // Gather unique metrics for the selected section
    const uniqueMetricsMap = new Map<string, { key: string, label: string }>();
    periods.forEach(p => {
        const sectionMetrics = data[p][selectedSection || ''] || [];
        sectionMetrics.forEach(m => {
            if (!uniqueMetricsMap.has(m.key)) {
                uniqueMetricsMap.set(m.key, { key: m.key, label: m.label });
            }
        });
    });

    const uniqueMetrics = Array.from(uniqueMetricsMap.values());
    
    // Filter rows by search
    const filteredMetrics = uniqueMetrics.filter(m => 
        searchQuery === '' || 
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full font-[system-ui] overflow-hidden rounded-[20px] shadow-2xl flex flex-col bg-[#0f172a]"
            style={{ 
                height: 'calc(100vh - 100px)',
                border: '1px solid rgba(59,130,246,0.15)' 
            }}>

            {/* Top Header Bar */}
            <div className="px-6 py-5 bg-[#0B1120]/90 backdrop-blur-xl border-b border-gray-800/60 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        {/* Logo/Brand Area */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10"
                            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-white font-black text-xl tracking-tight">Financial Statements</h1>
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest"
                                    style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    DATAGRID 2.0
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs tracking-widest font-medium mt-1 uppercase flex items-center gap-2">
                                <span className="text-blue-400">{symbol}</span>
                                <span>•</span>
                                <span>Interactive Matrix</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden sm:flex items-center gap-6 text-sm">
                         <div className="flex flex-col items-end">
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Total Periods</span>
                            <span className="text-white font-bold">{periods.length}</span>
                         </div>
                         <div className="w-px h-8 bg-gray-800/60" />
                         <div className="flex flex-col items-end">
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Data Points</span>
                            <span className="text-blue-400 font-bold">{filteredMetrics.length}</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 min-h-0 relative">
                
                {/* Fixed Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0B1120] to-[#070B14] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

                {/* Sidebar */}
                <div
                    className="flex-shrink-0 transition-all duration-300 flex flex-col relative z-20 backdrop-blur-md bg-[#0f172a]/60 border-r border-gray-800/60"
                    style={{ width: sidebarCollapsed ? '72px' : '260px' }}
                >
                    {/* Sidebar Toggle */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800/40">
                        {!sidebarCollapsed && (
                            <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase ml-2">Statements</span>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5 mx-auto text-gray-400 hover:text-white"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Section List */}
                    <div className="p-3 space-y-1.5 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {sections.map((section) => {
                            const isSelected = selectedSection === section;
                            return (
                                <button
                                    key={section}
                                    onClick={() => setSelectedSection(section)}
                                    className="w-full text-left transition-all duration-300 group rounded-xl relative overflow-hidden"
                                    style={{
                                        padding: sidebarCollapsed ? '12px' : '12px 16px',
                                        background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                                        border: isSelected ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                                    }}
                                >
                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
                                    
                                    {sidebarCollapsed ? (
                                        <div className="flex items-center justify-center text-xl filter drop-shadow opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                            {getSectionIcon(section)}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className={`text-lg filter drop-shadow flex-shrink-0 transition-all ${isSelected ? 'scale-110 opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                                {getSectionIcon(section)}
                                            </div>
                                            <span className={`text-xs font-bold tracking-wide truncate transition-all ${isSelected ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                {getSectionTitle(section)}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                    
                    {/* Controls Header */}
                    <div className="px-6 py-4 bg-[#0B1120]/40 backdrop-blur-md border-b border-gray-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-xl filter drop-shadow">{selectedSection ? getSectionIcon(selectedSection) : ''}</span>
                            <h2 className="text-gray-100 font-bold tracking-tight text-lg">
                                {selectedSection ? getSectionTitle(selectedSection) : 'Select Statement'}
                            </h2>
                        </div>
                        
                        {/* Controls Container */}
                        <div className="flex items-center gap-4">
                            
                            {/* Period Filter Toggle */}
                            <div className="flex items-center gap-1 bg-black/40 border border-gray-700/50 rounded-xl p-1 shadow-inner">
                                <button 
                                    onClick={() => setPeriodDisplayMode('all')}
                                    className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-all ${periodDisplayMode === 'all' ? 'bg-blue-600/30 text-blue-400 shadow-sm border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`}>
                                    All
                                </button>
                                <button 
                                    onClick={() => setPeriodDisplayMode('annual')}
                                    className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-all ${periodDisplayMode === 'annual' ? 'bg-emerald-600/30 text-emerald-400 shadow-sm border border-emerald-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`}>
                                    Annual
                                </button>
                                <button 
                                    onClick={() => setPeriodDisplayMode('quarterly')}
                                    className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-all ${periodDisplayMode === 'quarterly' ? 'bg-purple-600/30 text-purple-400 shadow-sm border border-purple-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`}>
                                    Quarterly
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex items-center bg-[#0f172a] border border-gray-700/50 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-all shadow-inner">
                                    <div className="pl-3 pr-2">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search specific metric..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent text-sm text-gray-200 py-2.5 pr-4 w-[240px] focus:outline-none focus:ring-0 placeholder-gray-600 font-medium"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="pr-3 text-gray-500 hover:text-gray-300">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Matrix Grid / Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar" style={{ scrollbarColor: 'rgba(59,130,246,0.2) transparent' }}>
                        <div className="min-w-max pb-8">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-30">
                                    <tr className="bg-[#0B1120]/95 backdrop-blur-xl shadow-md">
                                        <th className="sticky left-0 z-40 bg-[#0B1120]/95 backdrop-blur-xl px-6 py-4 font-bold text-xs uppercase tracking-[0.15em] text-gray-400 border-b border-r border-gray-800/60 min-w-[300px] max-w-[300px] shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)]">
                                            Statement of {selectedSection ? getSectionTitle(selectedSection) : 'Items'}
                                        </th>
                                        {periods.map(p => {
                                            // p is "2024 ANNUAL::source1". We clean it for display
                                            let displayTitle = p.split('::')[0]; // e.g., "2024 ANNUAL"
                                            // Replace ' ANNUAL' with empty string if it exists for cleaner view
                                            displayTitle = displayTitle.replace(' ANNUAL', '');
                                            return (
                                                <th key={p} className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-center border-b border-gray-800/60 min-w-[140px] max-w-[250px]">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-gray-200 bg-white/5 px-4 py-1.5 rounded-lg border border-white/5 shadow-inner">{displayTitle}</span>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMetrics.map((metric, idx) => (
                                        <tr key={metric.key} className="group transition-colors duration-150 hover:bg-white/[0.02]">
                                            {/* Row Header (Metric Label) */}
                                            <td className="sticky left-0 z-20 px-6 py-4 border-b border-r border-gray-800/40 min-w-[300px] max-w-[300px] bg-[#0f172a] group-hover:bg-[#131c31] transition-colors shadow-[4px_0_15px_-3px_rgba(0,0,0,0.3)] align-top">
                                                <div className="font-semibold text-sm text-gray-300 leading-relaxed pr-4 whitespace-normal break-words">
                                                    {metric.label}
                                                </div>
                                            </td>
                                            
                                            {/* Data Cells per period */}
                                            {periods.map(p => {
                                                const pData = data[p][selectedSection || ''] || [];
                                                const mData = pData.find(m => m.key === metric.key);
                                                const rawVal = mData ? (mData.value ?? mData.text) : null;
                                                const isPos = isPositiveValue(rawVal);
                                                
                                                return (
                                                    <td key={`${metric.key}-${p}`} className="px-6 py-4 border-b border-gray-800/20 text-right min-w-[140px] max-w-[250px] align-top">
                                                        <div className={`font-mono text-[13px] font-medium whitespace-normal break-words leading-relaxed ${
                                                            rawVal === null || rawVal === undefined || rawVal === ''
                                                                ? 'text-gray-600'
                                                                : isPos === true
                                                                    ? 'text-emerald-400'
                                                                    : isPos === false
                                                                        ? 'text-red-400'
                                                                        : 'text-gray-300'
                                                        }`}>
                                                            {fmt(rawVal)}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    
                                    {filteredMetrics.length === 0 && (
                                        <tr>
                                            <td colSpan={periods.length + 1} className="py-24 text-center">
                                                <div className="inline-flex flex-col items-center opacity-50">
                                                    <Search className="w-10 h-10 mb-4 text-gray-500" />
                                                    <span className="text-gray-400 font-semibold tracking-wide">No metrics match your search.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.2);
                    border-radius: 10px;
                    border: 2px solid #0f172a;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 130, 246, 0.4);
                }
            `}</style>
        </div>
    );
}