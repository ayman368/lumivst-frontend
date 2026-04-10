"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, AlertCircle, BarChart3, Search, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';

// ─── DESIGN TOKENS: Warm Cream × Forest Green ────────────────────────────────
// Page bg: #EDE8DC  |  Card bg: #FDFAF5  |  Row alt bg: #FAF7F0
// Border: #D9D2C3   |  Border-light: #E8E2D5
// Accent dark: #1C3D2E  |  Accent mid: #2D6A4F
// Text primary: #2C2416  |  secondary: #7A7060  |  muted: #A09880
// Positive: #1C7A3F  |  Negative: #C0392B  |  Null: #C8BFB0
// ─────────────────────────────────────────────────────────────────────────────

interface MetricRecord {
    key: string;
    label: string;
    value: string | number | null;
    text?: string;
}
interface MetricsBySection { [section: string]: MetricRecord[]; }
interface XBRLDataViewerEnhancedProps { symbol: string; }

const getSectionTitle = (s: string) =>
    s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const getSectionIcon = (section: string): React.ReactNode => {
    const icons: Record<string, string> = {
        income_statement: '📈', balance_sheet: '🏦', cash_flow: '💵',
        ratios: '📊', segments: '🔷', notes: '📋',
    };
    const key = Object.keys(icons).find(k => section.toLowerCase().includes(k.replace('_', '')));
    return <span>{key ? icons[key] : '📁'}</span>;
};

export default function XBRLDataViewerEnhanced({ symbol }: XBRLDataViewerEnhancedProps) {
    const [data, setData] = useState<Record<string, MetricsBySection> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [periodDisplayMode, setPeriodDisplayMode] = useState<'all' | 'annual' | 'quarterly'>('all');

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = API_BASE_URL;
                const res = await fetch(`${API_URL}/api/financial-metrics/${symbol}/data-by-section`);
                if (!res.ok) throw new Error('Failed to fetch financial data');
                setData(await res.json());
            } catch (err) {
                console.error(err);
                setError('No detailed data available for this company yet.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [symbol]);

    useEffect(() => {
        if (data && !selectedSection) {
            const all = new Set<string>();
            Object.values(data).forEach(pd => Object.keys(pd).forEach(s => all.add(s)));
            const sorted = Array.from(all).sort();
            if (sorted.length > 0) setSelectedSection(sorted[0]);
        }
    }, [data, selectedSection]);

    const fmt = (val: any) => {
        if (val === null || val === undefined || val === '') return '—';
        if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        if (!isNaN(Number(val)) && val.toString().length > 4)
            return Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });
        return val;
    };

    const isPositiveValue = (val: any): boolean | null => {
        if (val === null || val === undefined || val === '') return null;
        const num = typeof val === 'number' ? val : Number(val);
        if (isNaN(num)) return null;
        return num >= 0;
    };

    // ── Loading state ──
    if (loading) return (
        <div style={{ display: 'flex', height: '600px', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #E8E2D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 style={{ width: '32px', height: '32px', color: '#2D6A4F', opacity: 0.7 }} />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#2D6A4F', animation: 'xbrl-spin 1s cubic-bezier(0.5,0.1,0.5,0.9) infinite' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2C2416', marginBottom: '4px' }}>Loading Financial Data</p>
                    <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#2D6A4F', letterSpacing: '0.15em' }}>{symbol}</p>
                </div>
            </div>
            <style>{`@keyframes xbrl-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    // ── Error state ──
    if (error) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #F5AAAF', borderRadius: '16px', boxShadow: '0 1px 4px rgba(192,57,43,0.08)', maxWidth: '640px', margin: '80px auto 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FADADD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #F5AAAF' }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#C0392B' }} />
            </div>
            <div>
                <p style={{ fontWeight: 700, fontSize: '15px', color: '#C0392B', marginBottom: '4px' }}>Data Unavailable</p>
                <p style={{ fontSize: '13px', color: '#7A7060', lineHeight: 1.6 }}>{error}</p>
            </div>
        </div>
    );

    if (!data) return null;

    let periods = Object.keys(data).sort((a, b) => b.localeCompare(a));
    if (periodDisplayMode === 'annual')
        periods = periods.filter(p => /annual/i.test(p));
    else if (periodDisplayMode === 'quarterly')
        periods = periods.filter(p => !/annual/i.test(p));

    const allSections = new Set<string>();
    Object.values(data).forEach(pd => Object.keys(pd).forEach(s => allSections.add(s)));
    const sections = Array.from(allSections).sort();

    const uniqueMetricsMap = new Map<string, { key: string; label: string }>();
    periods.forEach(p => {
        (data[p][selectedSection || ''] || []).forEach(m => {
            if (!uniqueMetricsMap.has(m.key)) uniqueMetricsMap.set(m.key, { key: m.key, label: m.label });
        });
    });
    const uniqueMetrics = Array.from(uniqueMetricsMap.values());
    const filteredMetrics = uniqueMetrics.filter(m =>
        searchQuery === '' ||
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{
            width: '100%', overflow: 'hidden', borderRadius: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column',
            backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
            height: 'calc(100vh - 100px)',
            fontFamily: 'system-ui, sans-serif',
        }}>

            {/* ── Top Header ── */}
            <div style={{ padding: '20px 24px', backgroundColor: '#1C3D2E', borderBottom: '1px solid rgba(212,237,218,0.15)', position: 'sticky', top: 0, zIndex: 30, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,237,218,0.12)', border: '1px solid rgba(168,213,181,0.25)' }}>
                            <FileSpreadsheet style={{ width: '24px', height: '24px', color: '#A8D5B5' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.01em' }}>Financial Statements</h1>
                                <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', backgroundColor: 'rgba(212,237,218,0.15)', color: '#A8D5B5', border: '1px solid rgba(168,213,181,0.25)' }}>
                                    DATAGRID 2.0
                                </span>
                            </div>
                            <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,237,218,0.5)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#A8D5B5' }}>{symbol}</span>
                                <span>•</span>
                                <span>Interactive Matrix</span>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(212,237,218,0.4)', marginBottom: '2px' }}>Total Periods</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#F5F0E8' }}>{periods.length}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(212,237,218,0.15)' }} />
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(212,237,218,0.4)', marginBottom: '2px' }}>Data Points</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#A8D5B5' }}>{filteredMetrics.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section Tabs + Controls ── */}
            <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '0 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
                {/* Section tabs */}
                <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
                    {sections.map(section => {
                        const isSelected = selectedSection === section;
                        return (
                            <button key={section} onClick={() => setSelectedSection(section)} style={{
                                padding: '12px 20px 10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                border: 'none', backgroundColor: 'transparent', transition: 'all 0.2s',
                                color: isSelected ? '#1C3D2E' : '#A09880',
                                borderBottom: isSelected ? '2px solid #2D6A4F' : '2px solid transparent',
                            }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.color = '#7A7060'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.color = '#A09880'; }}
                            >
                                {getSectionTitle(section)}
                            </button>
                        );
                    })}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '10px', flexShrink: 0 }}>
                    {/* Period toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#A09880' }}>Period:</span>
                        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px', border: '1px solid #E5E7EB' }}>
                            {(['all', 'annual', 'quarterly'] as const).map(mode => (
                                <button key={mode} onClick={() => setPeriodDisplayMode(mode)} style={{
                                    padding: '4px 14px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                                    backgroundColor: periodDisplayMode === mode ? '#FFFFFF' : 'transparent',
                                    color: periodDisplayMode === mode ? '#111827' : '#6B7280',
                                    boxShadow: periodDisplayMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    borderWidth: '1px', borderStyle: 'solid',
                                    borderColor: periodDisplayMode === mode ? '#E5E7EB' : 'transparent',
                                }}>
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', transition: 'all 0.2s' }}>
                        <div style={{ paddingLeft: '10px', paddingRight: '6px' }}>
                            <Search style={{ width: '14px', height: '14px', color: '#A09880' }} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search metric..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                backgroundColor: 'transparent', fontSize: '12px', color: '#2C2416', padding: '6px 10px 6px 0', width: '160px',
                                border: 'none', outline: 'none', fontFamily: 'system-ui, sans-serif',
                            }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ paddingRight: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#A09880' }}>
                                <X style={{ width: '14px', height: '14px' }} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Data Matrix ── */}
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#FFFFFF' }}>
                <div style={{ minWidth: 'max-content', paddingBottom: '32px' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                            <tr style={{ backgroundColor: '#F9FAFB', boxShadow: '0 1px 0 #E5E7EB' }}>
                                {/* Sticky row label header */}
                                <th style={{
                                    position: 'sticky', left: 0, zIndex: 40, backgroundColor: '#F9FAFB',
                                    padding: '16px 24px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B7280',
                                    borderBottom: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB',
                                    minWidth: '300px', maxWidth: '300px',
                                    boxShadow: '4px 0 10px -3px rgba(0,0,0,0.04)',
                                }}>
                                    {selectedSection ? getSectionTitle(selectedSection) : 'Items'}
                                </th>
                                {periods.map(p => {
                                    let title = p.replace(/\s*(annual)/i, ' Annual').trim();
                                    return (
                                        <th key={p} style={{
                                            padding: '16px 24px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                                            textAlign: 'center', borderBottom: '1px solid #E5E7EB', minWidth: '140px', maxWidth: '250px',
                                        }}>
                                            <span style={{ color: '#374151', backgroundColor: '#FFFFFF', padding: '4px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'inline-block' }}>
                                                {title}
                                            </span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMetrics.map((metric, idx) => (
                                <tr key={metric.key} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB')}
                                >
                                    {/* Sticky metric label */}
                                    <td style={{
                                        position: 'sticky', left: 0, zIndex: 20,
                                        padding: '14px 24px', borderBottom: '1px solid #F3F4F6', borderRight: '1px solid #E5E7EB',
                                        minWidth: '300px', maxWidth: '300px', backgroundColor: 'inherit',
                                        boxShadow: '4px 0 10px -3px rgba(0,0,0,0.03)', verticalAlign: 'top',
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', lineHeight: 1.5, paddingRight: '16px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                            {metric.label}
                                        </div>
                                    </td>

                                    {/* Period data cells */}
                                    {periods.map(p => {
                                        const pData = data[p][selectedSection || ''] || [];
                                        const mData = pData.find(m => m.key === metric.key);
                                        const rawVal = mData ? (mData.value ?? mData.text) : null;
                                        const isPos = isPositiveValue(rawVal);
                                        const isEmpty = rawVal === null || rawVal === undefined || rawVal === '';

                                        return (
                                            <td key={`${metric.key}-${p}`} style={{
                                                padding: '14px 24px', borderBottom: '1px solid #F3F4F6',
                                                textAlign: 'right', minWidth: '140px', maxWidth: '250px', verticalAlign: 'top',
                                            }}>
                                                <div style={{
                                                    fontFamily: 'monospace', fontSize: '13px', fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'normal',
                                                    color: isEmpty ? '#9CA3AF' : isPos === true ? '#15803D' : isPos === false ? '#DC2626' : '#374151',
                                                }}>
                                                    {fmt(rawVal)}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {filteredMetrics.length === 0 && (
                                <tr>
                                    <td colSpan={periods.length + 1} style={{ padding: '80px 24px', textAlign: 'center', backgroundColor: '#FDFAF5' }}>
                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                            <Search style={{ width: '40px', height: '40px', marginBottom: '12px', color: '#A09880' }} />
                                            <span style={{ fontWeight: 600, color: '#7A7060', fontSize: '14px' }}>No metrics match your search.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; border: 2px solid #FFFFFF; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
                @keyframes xbrl-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}