"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, AlertCircle, Settings, Eye, EyeOff, ChevronDown } from 'lucide-react';

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

const COLOR_PALETTE = ['blue', 'green', 'purple', 'orange', 'yellow', 'pink', 'indigo', 'cyan', 'red', 'teal'];

// Convert section name to readable title (e.g., 'income_statement' -> 'Income Statement')
const getSectionTitle = (section: string): string => {
    return section
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Get color for section based on index
const getSectionColor = (section: string, index: number): string => {
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

export default function XBRLDataViewerEnhanced({ symbol }: XBRLDataViewerEnhancedProps) {
    const [data, setData] = useState<Record<string, MetricsBySection> | null>(null);
    const [settings, setSettings] = useState<MetricDisplaySetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set());

    // Fetch data and settings
    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                
                // Fetch financial data by section
                const dataRes = await fetch(`${API_URL}/api/financial-metrics/${symbol}/data-by-section`);
                if (!dataRes.ok) throw new Error("Failed to fetch financial data");
                const jsonData = await dataRes.json();
                setData(jsonData);
                
                // Set first period as default
                const periods = Object.keys(jsonData);
                if (periods.length > 0) {
                    setSelectedPeriod(periods[0]);
                }
                
                // Fetch display settings
                const settingsRes = await fetch(`${API_URL}/api/financial-metrics/metric-settings/${symbol}`);
                if (settingsRes.ok) {
                    const jsonSettings = await settingsRes.json();
                    setSettings(jsonSettings);
                    
                    // Initialize visible metrics based on settings
                    const visible = new Set<string>();
                    jsonSettings.forEach((s: MetricDisplaySetting) => {
                        if (s.is_visible) {
                            visible.add(s.metric_name);
                        }
                    });
                    setVisibleMetrics(visible);
                }
            } catch (err) {
                console.error(err);
                setError("No detailed data available for this company yet.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [symbol]);

    // Handle visibility toggle
    const handleToggleMetric = async (metricName: string, currentlyVisible: boolean) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(
                `${API_URL}/api/financial-metrics/metric-settings/${symbol}/${metricName}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_visible: !currentlyVisible })
                }
            );
            
            if (res.ok) {
                setVisibleMetrics(prev => {
                    const newSet = new Set(prev);
                    if (!currentlyVisible) {
                        newSet.add(metricName);
                    } else {
                        newSet.delete(metricName);
                    }
                    return newSet;
                });
            }
        } catch (err) {
            console.error("Error updating visibility:", err);
        }
    };

    // Handle section toggle
    const handleToggleSection = async (section: string, shouldBeVisible: boolean) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(
                `${API_URL}/api/financial-metrics/metric-settings/${symbol}/bulk-update`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section, is_visible: shouldBeVisible })
                }
            );
            
            if (res.ok) {
                // Update all metrics in this section
                const metricsInSection = settings
                    .filter(s => s.section === section)
                    .map(s => s.metric_name);
                
                setVisibleMetrics(prev => {
                    const newSet = new Set(prev);
                    metricsInSection.forEach(m => {
                        if (shouldBeVisible) {
                            newSet.add(m);
                        } else {
                            newSet.delete(m);
                        }
                    });
                    return newSet;
                });
            }
        } catch (err) {
            console.error("Error updating section visibility:", err);
        }
    };

    const fmt = (val: any) => {
        if (val === null || val === undefined || val === "") return "-";
        if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        if (!isNaN(Number(val)) && val.toString().length > 4) {
            return Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return val;
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-purple-600" />
        </div>
    );
    
    if (error) return (
        <div className="flex items-center gap-2 p-4 text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle size={20} /> {error}
        </div>
    );
    
    if (!data || !selectedPeriod) return null;

    const currentPeriodData = data[selectedPeriod] || {};
    const sections = Object.keys(currentPeriodData).sort();
    const periods = Object.keys(data).sort().reverse();

    // Calculate visible metrics count per section
    const visibleCounts: Record<string, number> = {};
    sections.forEach(section => {
        visibleCounts[section] = (currentPeriodData[section] || [])
            .filter(m => visibleMetrics.has(m.key))
            .length;
    });

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
            {/* Header with Controls */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        Financial Data by Section
                    </h3>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Toggle settings"
                    >
                        <Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>
                
                {/* Period Selector */}
                <div className="flex gap-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Period:</label>
                    <select
                        value={selectedPeriod || ''}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                    >
                        {periods.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/50">
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-3">Manage Sections</h4>
                    <div className="space-y-2">
                        {sections.map((section, index) => {
                            const metricsInSection = currentPeriodData[section] || [];
                            const visibleInSection = metricsInSection.filter(m => visibleMetrics.has(m.key)).length;
                            const allVisible = visibleInSection === metricsInSection.length;
                            const someVisible = visibleInSection > 0;
                            
                            return (
                                <button
                                    key={section}
                                    onClick={() => handleToggleSection(section, !allVisible)}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {getSectionTitle(section)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {visibleInSection}/{metricsInSection.length}
                                        </span>
                                        {allVisible ? (
                                            <Eye className="w-4 h-4 text-green-600" />
                                        ) : someVisible ? (
                                            <div className="w-4 h-4 rounded border border-yellow-500 flex items-center justify-center text-yellow-500 text-xs">-</div>
                                        ) : (
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Data Sections */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-6">
                {sections.map((section, index) => {
                    const metrics = currentPeriodData[section] || [];
                    const filtered = metrics.filter(m => visibleMetrics.has(m.key));
                    const isExpanded = expandedSections[section] ?? true;
                    const sectionTitle = getSectionTitle(section);
                    const sectionColor = getSectionColor(section, index);

                    return (
                        <div key={section} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                            {/* Section Header */}
                            <button
                                onClick={() => setExpandedSections(prev => ({ ...prev, [section]: !isExpanded }))}
                                className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <ChevronDown 
                                        className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                    />
                                    <span className={`font-semibold text-sm text-${sectionColor}-600`}>
                                        {sectionTitle}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {filtered.length}/{metrics.length}
                                    </span>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSection(section, filtered.length === 0);
                                        }}
                                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                                    >
                                        {filtered.length > 0 ? (
                                            <Eye className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                    {filtered.map((metric, idx) => (
                                        <div key={`${metric.key}-${idx}`} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{metric.label}</h5>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{metric.key}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleMetric(metric.key, true)}
                                                        className="ml-4 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 text-green-600" />
                                                    </button>
                                                </div>
                                                <div className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                                                    {fmt(metric.value || metric.text)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filtered.length === 0 && (
                                        <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                            All metrics in this section are hidden.
                                            <button
                                                onClick={() => handleToggleSection(section, true)}
                                                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Show all
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
