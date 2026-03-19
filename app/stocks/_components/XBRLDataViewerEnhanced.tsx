"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, AlertCircle, Settings, Eye, EyeOff, Menu, TrendingUp, BarChart3, ChevronRight, Search, Filter, X } from 'lucide-react';

interface MetricRecord {
    key: string;
    label: string;
    value: string | number | null;
    text?: string;
}

interface MetricsBySection {
    [section: string]: MetricRecord[];
}

interface MetricDisplaySetting {
    metric_name: string;
    section: string;
    subsection?: string;
    description_en?: string;
    is_visible: boolean;
    custom_display_label?: string;
    unit: string;
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

const getSectionIcon = (section: string): string => {
    const icons: Record<string, string> = {
        income_statement: '📈',
        balance_sheet: '🏦',
        cash_flow: '💵',
        ratios: '📊',
        segments: '🔷',
        notes: '📋',
    };
    const key = Object.keys(icons).find(k => section.toLowerCase().includes(k.replace('_', '')));
    return key ? icons[key] : '📁';
};

export default function XBRLDataViewerEnhanced({ symbol }: XBRLDataViewerEnhancedProps) {
    const [data, setData] = useState<Record<string, MetricsBySection> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const dataRes = await fetch(`${API_URL}/api/financial-metrics/${symbol}/data-by-section`);
                if (!dataRes.ok) throw new Error("Failed to fetch financial data");
                const jsonData = await dataRes.json();
                setData(jsonData);
                const periods = Object.keys(jsonData);
                if (periods.length > 0) setSelectedPeriod(periods[0]);
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
        if (data && selectedPeriod && !selectedSection) {
            const sections = Object.keys(data[selectedPeriod] || {}).sort();
            if (sections.length > 0) setSelectedSection(sections[0]);
        }
    }, [data, selectedPeriod, selectedSection]);

    const fmt = (val: any) => {
        if (val === null || val === undefined || val === "") return "—";
        if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
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
        <div className="flex h-96 items-center justify-center bg-[#0a0e1a]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-[#1e2d4a] flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-[#00d4ff] animate-spin" />
                    </div>
                    <BarChart3 className="absolute inset-0 m-auto w-6 h-6 text-[#00d4ff]" />
                </div>
                <div className="text-center">
                    <p className="text-[#e8f4ff] font-semibold tracking-wider text-sm">LOADING XBRL DATA</p>
                    <p className="text-[#4a6080] text-xs mt-1 tracking-widest">{symbol}</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 p-5 bg-[#0a0e1a] border border-[#ff4d4d]/20 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#ff4d4d]/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-[#ff4d4d]" />
            </div>
            <div>
                <p className="text-[#ff4d4d] font-medium text-sm">Data Unavailable</p>
                <p className="text-[#4a6080] text-xs mt-0.5">{error}</p>
            </div>
        </div>
    );

    if (!data || !selectedPeriod) return null;

    const currentPeriodData = data[selectedPeriod] || {};
    const sections = Object.keys(currentPeriodData).sort();
    const periods = Object.keys(data).sort().reverse();
    const selectedSectionMetrics = selectedSection ? currentPeriodData[selectedSection] || [] : [];

    const filteredMetrics = selectedSectionMetrics.filter(m => {
        const matchesSearch = searchQuery === '' ||
            m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.key.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const visibleCounts: Record<string, { visible: number; total: number }> = {};
    sections.forEach(section => {
        const metrics = currentPeriodData[section] || [];
        visibleCounts[section] = {
            visible: metrics.length,
            total: metrics.length
        };
    });

    return (
        <div className="w-full font-[system-ui] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
            style={{ 
                height: 'calc(100vh - 110px)',
                background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1020 100%)', 
                border: '1px solid rgba(0,212,255,0.08)' 
            }}>

            {/* Top Header Bar */}
            <div style={{ background: 'linear-gradient(90deg, #0d1830 0%, #0a1525 100%)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}
                className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo/Brand Area */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #00d4ff22, #0066ff22)', border: '1px solid rgba(0,212,255,0.3)' }}>
                                <FileSpreadsheet className="w-5 h-5 text-[#00d4ff]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-bold text-base tracking-tight">XBRL</span>
                                    <span className="text-[#00d4ff] font-light text-base tracking-tight">Financial Data</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest"
                                        style={{ background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-[#3a5070] text-xs tracking-widest font-medium mt-0.5">{symbol} · SEC FILINGS</p>
                            </div>
                        </div>

                        {/* Period Tabs */}
                        <div 
                            className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto flex-nowrap" 
                            style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.06)',
                                maxWidth: '45vw',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#1a2840 transparent'
                            }}
                        >
                            {periods.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setSelectedPeriod(p)}
                                    className="px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 flex-shrink-0"
                                    style={selectedPeriod === p ? {
                                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,102,255,0.15))',
                                        color: '#00d4ff',
                                        border: '1px solid rgba(0,212,255,0.3)',
                                        boxShadow: '0 0 12px rgba(0,212,255,0.15)'
                                    } : {
                                        color: '#4a6080',
                                        border: '1px solid transparent'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Controls hidden to prevent user edit */}
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 min-h-0">

                {/* Sidebar */}
                <div
                    className="flex-shrink-0 transition-all duration-300 flex flex-col"
                    style={{
                        width: sidebarCollapsed ? '60px' : '220px',
                        background: 'linear-gradient(180deg, #080c18 0%, #0a0f1e 100%)',
                        borderRight: '1px solid rgba(0,212,255,0.06)'
                    }}
                >
                    {/* Sidebar Toggle */}
                    <div className="flex items-center justify-between p-3"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {!sidebarCollapsed && (
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#2a4060] uppercase">Sections</span>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-all ml-auto"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#3a5070' }}
                        >
                            <Menu className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Section List */}
                    <div className="p-2 space-y-0.5 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {sections.map((section) => {
                            const counts = visibleCounts[section] || { visible: 0, total: 0 };
                            const isSelected = selectedSection === section;
                            const pct = counts.total > 0 ? (counts.visible / counts.total) * 100 : 0;

                            return (
                                <button
                                    key={section}
                                    onClick={() => setSelectedSection(section)}
                                    className="w-full text-left rounded-lg transition-all duration-200 group"
                                    style={{
                                        padding: sidebarCollapsed ? '10px 8px' : '10px 12px',
                                        background: isSelected
                                            ? 'linear-gradient(90deg, rgba(0,212,255,0.12), rgba(0,102,255,0.06))'
                                            : 'transparent',
                                        borderLeft: isSelected ? '2px solid #00d4ff' : '2px solid transparent',
                                    }}
                                >
                                    {sidebarCollapsed ? (
                                        <div className="flex items-center justify-center">
                                            <span className="text-base">{getSectionIcon(section)}</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold truncate"
                                                    style={{ color: isSelected ? '#e0f4ff' : '#3a5878', maxWidth: '130px' }}>
                                                    {getSectionTitle(section)}
                                                </span>
                                                <span className="text-[10px] font-bold ml-1 flex-shrink-0"
                                                    style={{ color: isSelected ? '#00d4ff' : '#2a4060' }}>
                                                    {counts.visible}/{counts.total}
                                                </span>
                                            </div>
                                            {/* Mini progress bar */}
                                            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: isSelected
                                                            ? 'linear-gradient(90deg, #00d4ff, #0066ff)'
                                                            : 'rgba(74,96,128,0.5)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Section Header + Search Bar */}
                    <div style={{ background: '#080c18', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {selectedSection && (
                                    <>
                                        <span className="text-lg">{getSectionIcon(selectedSection)}</span>
                                        <div>
                                            <h2 className="text-white font-bold text-lg leading-tight">
                                                {getSectionTitle(selectedSection)}
                                            </h2>
                                            <p className="text-[#2a4060] text-xs mt-0.5">
                                                <span className="text-[#00d4ff] font-semibold">{filteredMetrics.length}</span>
                                                <span> visible · </span>
                                                <span>{selectedSectionMetrics.length} total fields</span>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2a4060]" />
                                <input
                                    type="text"
                                    placeholder="Search metrics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-8 py-2 text-xs rounded-lg outline-none transition-all"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#a0b8cc',
                                        width: '220px'
                                    }}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <X className="w-3 h-3 text-[#3a5070]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Panel removed for users */}

                    {/* Data Table */}
                    <div className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a2840 transparent' }}>
                        <table className="w-full border-collapse">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr style={{ background: '#060a14', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                                    <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.15em] uppercase"
                                        style={{ color: '#2a4060', width: '75%' }}>
                                        Metric
                                    </th>
                                    <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.15em] uppercase"
                                        style={{ color: '#2a4060', width: '25%' }}>
                                        Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMetrics.map((metric, idx) => {
                                    const rawVal = metric.value ?? metric.text;
                                    const isPos = isPositiveValue(rawVal);
                                    const isHovered = hoveredRow === metric.key;

                                    return (
                                        <tr
                                            key={`${metric.key}-${idx}`}
                                            onMouseEnter={() => setHoveredRow(metric.key)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                background: isHovered
                                                    ? 'linear-gradient(90deg, rgba(0,212,255,0.04), rgba(0,102,255,0.02))'
                                                    : idx % 2 === 0 ? 'rgba(255,255,255,0.008)' : 'transparent',
                                                transition: 'background 0.15s ease'
                                            }}
                                        >
                                            {/* Metric Label */}
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium"
                                                        style={{ color: isHovered ? '#c8e8f8' : '#7090a8' }}>
                                                        {metric.label}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Value */}
                                            <td className="px-6 py-3.5 text-right">
                                                <span className="text-sm font-bold font-mono"
                                                    style={{
                                                        color: rawVal === null || rawVal === undefined || rawVal === ''
                                                            ? '#2a4060'
                                                            : isPos === true
                                                                ? '#00d4a0'
                                                                : isPos === false
                                                                    ? '#ff6b6b'
                                                                    : '#c8e8f8'
                                                    }}>
                                                    {fmt(rawVal)}
                                                </span>
                                            </td>

                                            {/* Key */}
                                            {/* <td className="px-6 py-3.5">
                                                <code className="text-[10px] px-2 py-0.5 rounded tracking-wide"
                                                    style={{
                                                        background: 'rgba(0,212,255,0.05)',
                                                        color: '#2a5070',
                                                        border: '1px solid rgba(0,212,255,0.08)',
                                                        fontFamily: 'monospace'
                                                    }}>
                                                    {metric.key}
                                                </code>
                                            </td> */}

                                        </tr>
                                    );
                                })}

                                {filteredMetrics.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <BarChart3 className="w-5 h-5 text-[#2a4060]" />
                                                </div>
                                                <div>
                                                    <p className="text-[#3a5878] text-sm font-semibold">No metrics to display</p>
                                                    <p className="text-[#1e3050] text-xs mt-1">
                                                        {searchQuery ? 'Try a different search term' : 'Enable fields using Manage Fields'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Status Bar */}
                    <div style={{ background: '#060a14', borderTop: '1px solid rgba(0,212,255,0.06)' }}
                        className="px-6 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4a0]" />
                                <span className="text-[10px] text-[#2a4060] tracking-wide">XBRL Verified</span>
                            </div>
                            <span className="text-[10px] text-[#1a3050]">·</span>
                            <span className="text-[10px] text-[#2a4060]">Period: <span className="text-[#4a7090]">{selectedPeriod}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#1a3050]">
                                {filteredMetrics.length} / {selectedSectionMetrics.length} fields
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}