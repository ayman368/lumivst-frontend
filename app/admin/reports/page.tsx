"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchReportsSummary, fetchCompanyDetails, deleteFiling } from './actions';

// ── Types ──
type CompanySummary = {
    symbol: string;
    en_count: number;
    ar_count: number;
    total_count: number;
    last_updated: string | null;
};

type Filing = {
    id: number;
    category: string;
    period: string;
    year: number;
    file_url: string | null;
    source_url: string | null;
    file_type: string | null;
    language: string;
    created_at: string | null;
};

type View = 'summary' | 'details';

// ── Category Styling ──
const CATEGORY_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
    'Financial Statements': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: '📊' },
    'XBRL':                 { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: '📑' },
    'Board Report':         { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700', icon: '📋' },
    'ESG Report':           { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '🌱' },
};

const FILE_TYPE_ICON: Record<string, string> = {
    pdf: '📄',
    excel: '📗',
    other: '📎',
};

export default function AdminReportsPage() {
    // ── State ──
    const [view, setView] = useState<View>('summary');
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [totalFilings, setTotalFilings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Details view
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Search & filter
    const [search, setSearch] = useState('');
    const [langFilter, setLangFilter] = useState<'all' | 'en' | 'ar'>('all');
    const [catFilter, setCatFilter] = useState<string>('all');

    // Deleting state
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ── Load Summary ──
    const loadSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await fetchReportsSummary();
        if (res.success && res.data) {
            setCompanies(res.data.companies);
            setTotalFilings(res.data.total_filings);
        } else {
            setError(res.error || 'Failed to load');
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadSummary(); }, [loadSummary]);

    // ── Load Company Details ──
    const openDetails = async (symbol: string) => {
        setSelectedSymbol(symbol);
        setView('details');
        setDetailsLoading(true);
        setFilings([]);
        const res = await fetchCompanyDetails(symbol);
        if (res.success && res.data) {
            setFilings(res.data.filings);
        }
        setDetailsLoading(false);
    };

    // ── Delete Filing ──
    const handleDelete = async (filingId: number) => {
        if (!selectedSymbol) return;
        if (!confirm(`Are you sure you want to delete filing #${filingId}?\nThis will also remove the file from cloud storage.`)) return;
        setDeletingId(filingId);
        const res = await deleteFiling(selectedSymbol, filingId);
        if (res.success) {
            setFilings(prev => prev.filter(f => f.id !== filingId));
        } else {
            alert(`Delete failed: ${res.error}`);
        }
        setDeletingId(null);
    };

    // ── Back to Summary ──
    const backToSummary = () => {
        setView('summary');
        setSelectedSymbol(null);
        setFilings([]);
        loadSummary(); // refresh counts
    };

    // ── Filtered Data ──
    const filteredCompanies = companies.filter(c =>
        c.symbol.includes(search)
    );

    const filteredFilings = filings.filter(f => {
        if (langFilter !== 'all' && f.language !== langFilter) return false;
        if (catFilter !== 'all' && f.category !== catFilter) return false;
        return true;
    });

    // Group filings by year for display
    const filingsByYear: Record<number, Filing[]> = {};
    filteredFilings.forEach(f => {
        if (!filingsByYear[f.year]) filingsByYear[f.year] = [];
        filingsByYear[f.year].push(f);
    });
    const sortedYears = Object.keys(filingsByYear).map(Number).sort((a, b) => b - a);

    // ── Stats ──
    const enTotal = filings.filter(f => f.language === 'en').length;
    const arTotal = filings.filter(f => f.language === 'ar').length;
    const pdfTotal = filings.filter(f => f.file_type === 'pdf').length;
    const excelTotal = filings.filter(f => f.file_type === 'excel').length;

    // ── Render ──
    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

                {/* ── Header ── */}
                <div className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow">R</div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports Management</h1>
                                <p className="text-xs text-slate-400 mt-0.5">Manage official company filings · DB & R2 Storage</p>
                            </div>
                        </div>
                        <Link
                            href="/admin"
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition shadow-sm"
                        >
                            ← Back to Admin
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-7">

                    {/* ═══════════════════════ SUMMARY VIEW ═══════════════════════ */}
                    {view === 'summary' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Companies</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '—' : companies.length}</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Filings</p>
                                    <p className="text-3xl font-bold text-indigo-600 mt-1">{loading ? '—' : totalFilings.toLocaleString()}</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg per Company</p>
                                    <p className="text-3xl font-bold text-emerald-600 mt-1">
                                        {loading || companies.length === 0 ? '—' : Math.round(totalFilings / companies.length)}
                                    </p>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative flex-1 max-w-sm">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by symbol..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={loadSummary}
                                    disabled={loading}
                                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                                >
                                    {loading ? '⏳' : '🔄'} Refresh
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
                                    ❌ {error}
                                </div>
                            )}

                            {/* Companies Table */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-700">📁 Companies with Filings</h2>
                                    <span className="text-xs text-slate-400">{filteredCompanies.length} companies</span>
                                </div>

                                {loading ? (
                                    <div className="p-12 text-center">
                                        <div className="inline-block w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                                        <p className="text-sm text-slate-400 mt-3">Loading reports data...</p>
                                    </div>
                                ) : filteredCompanies.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 text-sm">
                                        No companies found {search ? `matching "${search}"` : ''}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="px-6 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Symbol</th>
                                                    <th className="px-6 py-3 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">🇬🇧 EN</th>
                                                    <th className="px-6 py-3 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">🇸🇦 AR</th>
                                                    <th className="px-6 py-3 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">Total</th>
                                                    <th className="px-6 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Last Updated</th>
                                                    <th className="px-6 py-3 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCompanies.map(c => (
                                                    <tr
                                                        key={c.symbol}
                                                        className="border-b border-slate-50 hover:bg-indigo-50/40 transition-colors cursor-pointer"
                                                        onClick={() => openDetails(c.symbol)}
                                                    >
                                                        <td className="px-6 py-3.5">
                                                            <span className="font-bold text-slate-900 font-mono">{c.symbol}</span>
                                                        </td>
                                                        <td className="px-6 py-3.5 text-center">
                                                            <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full text-xs font-semibold ${c.en_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                                                {c.en_count}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3.5 text-center">
                                                            <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full text-xs font-semibold ${c.ar_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                                {c.ar_count}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3.5 text-center font-bold text-slate-700">{c.total_count}</td>
                                                        <td className="px-6 py-3.5 text-slate-400 text-xs font-mono">
                                                            {c.last_updated ? new Date(c.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                        </td>
                                                        <td className="px-6 py-3.5 text-center">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openDetails(c.symbol); }}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition shadow-sm"
                                                            >
                                                                View Details →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ═══════════════════════ DETAILS VIEW ═══════════════════════ */}
                    {view === 'details' && selectedSymbol && (
                        <>
                            {/* Back + Title */}
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={backToSummary}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm"
                                >
                                    ← Back
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                        Company <span className="text-indigo-600 font-mono">{selectedSymbol}</span>
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">{filings.length} total filings</p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            {!detailsLoading && filings.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                    {[
                                        { label: '🇬🇧 English', value: enTotal, color: 'text-blue-600' },
                                        { label: '🇸🇦 Arabic', value: arTotal, color: 'text-emerald-600' },
                                        { label: '📄 PDF', value: pdfTotal, color: 'text-red-500' },
                                        { label: '📗 Excel', value: excelTotal, color: 'text-green-600' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                                            <p className="text-xs text-slate-400">{s.label}</p>
                                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {/* Language filter */}
                                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                    {[
                                        { key: 'all', label: 'All' },
                                        { key: 'en', label: '🇬🇧 EN' },
                                        { key: 'ar', label: '🇸🇦 AR' },
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setLangFilter(t.key as any)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${langFilter === t.key
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Category filter */}
                                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                    <button
                                        onClick={() => setCatFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${catFilter === 'all'
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        All Categories
                                    </button>
                                    {Object.entries(CATEGORY_STYLE).map(([cat, style]) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCatFilter(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${catFilter === cat
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                            }`}
                                        >
                                            {style.icon} {cat}
                                        </button>
                                    ))}
                                </div>

                                <span className="text-xs text-slate-400 ml-auto">
                                    Showing {filteredFilings.length} of {filings.length}
                                </span>
                            </div>

                            {/* Loading */}
                            {detailsLoading ? (
                                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                                    <div className="inline-block w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-400 mt-3">Loading filings for {selectedSymbol}...</p>
                                </div>
                            ) : filings.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                                    <p className="text-slate-400 text-sm">No filings found for this company.</p>
                                </div>
                            ) : (
                                /* Filings grouped by year */
                                <div className="space-y-6">
                                    {sortedYears.map(year => (
                                        <div key={year} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            {/* Year header */}
                                            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-slate-700">📅 {year}</h3>
                                                <span className="text-xs text-slate-400">{filingsByYear[year].length} files</span>
                                            </div>

                                            {/* Filings grid */}
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {filingsByYear[year].map(f => {
                                                    const catStyle = CATEGORY_STYLE[f.category] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', icon: '📎' };
                                                    return (
                                                        <div
                                                            key={f.id}
                                                            className={`border rounded-xl p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-md ${catStyle.bg}`}
                                                        >
                                                            {/* Top: category + lang badge */}
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-xs font-semibold ${catStyle.text}`}>
                                                                    {catStyle.icon} {f.category}
                                                                </span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                                                    f.language === 'en'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                    {f.language === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}
                                                                </span>
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                                                <span className="font-medium">{f.period}</span>
                                                                <span>·</span>
                                                                <span>{FILE_TYPE_ICON[f.file_type || 'other']} {(f.file_type || 'other').toUpperCase()}</span>
                                                                <span>·</span>
                                                                <span className="text-slate-400">ID: {f.id}</span>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 mt-auto pt-2">
                                                                {f.file_url && (
                                                                    <a
                                                                        href={f.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex-1 text-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                                                                    >
                                                                        🔗 Open File
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(f.id)}
                                                                    disabled={deletingId === f.id}
                                                                    className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                                                                >
                                                                    {deletingId === f.id ? '⏳' : '🗑️'} Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
