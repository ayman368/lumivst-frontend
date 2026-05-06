"use client";
import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { triggerScraperAction } from './actions';

type Status = 'idle' | 'running' | 'success' | 'error';

const SCHEDULE = {
    daily: [
        { id: 'sp500', title: 'S&P 500 History', source: 'Yahoo Finance', url: '/api/economic-indicators/scrape/SP500', msg: '✅ S&P 500 started!', when: 'Every business day', file: 'sp500_scraper.py' },
        { id: 'treasury-gov', title: 'Treasury.gov Rates', source: 'Treasury.gov', url: '/api/economic-indicators/scrape/treasury-gov?mode=incremental', msg: '✅ Treasury.gov started!', when: 'Every business day', file: 'treasury_gov_scraper.py', note: 'Faster than FRED — same table' },
        { id: 'treasury-fred', title: 'Treasury Yield (FRED)', source: 'FRED API', url: '/api/economic-indicators/scrape/yield-curve', msg: '✅ Treasury FRED started!', when: 'Every business day', file: 'treasury_scraper.py' },
        { id: 'a-spread', title: 'A Corporate Spread', source: 'FRED', url: '/api/economic-indicators/scrape/BAMLC0A3CA', msg: '✅ A Spread started!', when: 'Every business day', file: 'fred_scraper.py' },
        { id: 'bbb-spread', title: 'BBB Corporate Spread', source: 'FRED', url: '/api/economic-indicators/scrape/BAMLC0A4CBBB', msg: '✅ BBB Spread started!', when: 'Every business day', file: 'fred_scraper.py' },
        { id: 'a-ey', title: 'A Effective Yield', source: 'FRED', url: '/api/economic-indicators/scrape/BAMLC0A3CAEY', msg: '✅ A EY started!', when: 'Every business day', file: 'fred_scraper.py' },
        { id: 'eurodollar', title: 'Eurodollar Futures', source: 'Investing.com', url: '/api/economic-indicators/scrape/eurodollar-futures', msg: '✅ Eurodollar started!', when: 'Every business day', file: 'eurodollar_scraper.py', snapshot: true },
        { id: 'cme', title: 'CME FedWatch', source: 'CME Group', url: '/api/economic-indicators/scrape/cme-fedwatch', msg: '✅ CME FedWatch started!', when: 'Every business day', file: 'cmefedwatch_scraper.py', snapshot: true, note: 'Selenium' },
    ],
    weekly: [
        { id: 'ic4wsa', title: 'Initial Claims (4W)', source: 'FRED', url: '/api/economic-indicators/scrape/IC4WSA', msg: '✅ IC4WSA started!', when: 'Every Thursday', file: 'fred_scraper.py' },
    ],
    monthly: [
        { id: 'unrate', title: 'Unemployment Rate', source: 'FRED', url: '/api/economic-indicators/scrape/UNRATE', msg: '✅ UNRATE started!', when: '1st Friday of month', file: 'fred_scraper.py' },
        { id: 'payems', title: 'Nonfarm Payrolls', source: 'FRED', url: '/api/economic-indicators/scrape/PAYEMS', msg: '✅ PAYEMS started!', when: '1st Friday of month', file: 'fred_scraper.py' },
        { id: 'sp500-pe', title: 'S&P 500 PE (Multpl)', source: 'Multpl.com', url: '/api/economic-indicators/scrape/sp500-pe', msg: '✅ Multpl PE started (updates History table)!', when: 'Once a month', file: 'sp500_pe_scraper.py' },
        { id: 'sp500-ey', title: 'S&P 500 Earnings Yield', source: 'GuruFocus', url: '/api/economic-indicators/scrape/SP500_EY', msg: '✅ SP500 EY started!', when: 'Once a month', file: 'gurufocus_scraper.py', note: 'Selenium' },
        { id: 'sp500-pe-guru', title: 'S&P 500 PE Ratio', source: 'GuruFocus', url: '/api/economic-indicators/scrape/SP500_PE', msg: '✅ SP500 PE Ratio started!', when: 'Once a month', file: 'gurufocus_scraper.py', note: 'Selenium' },
    ],
};

const PIPELINES = [
    {
        table: 'sp500_history', label: 'S&P 500 History',
        scrapers: ['sp500_scraper.py → OHLCV daily', 'sp500_pe_scraper.py → PE column (for yield curve calculation)'],
        pages: ['/bonds/yield-curve'],
    },
    {
        table: 'treasury_yield_curves', label: 'Treasury Yield Curves',
        scrapers: ['treasury_scraper.py → FRED API', 'treasury_gov_scraper.py → Treasury.gov (faster)'],
        pages: ['/bonds/daily-treasury-yield-curve', '/bonds/treasury-yield-curve', '/bonds/yield-curve'],
        warn: 'Both write to same table — Treasury.gov is recommended',
    },
    {
        table: 'economic_indicators', label: 'Economic Indicators',
        scrapers: ['fred_scraper.py → UNRATE, PAYEMS, IC4WSA, Spreads, EY', 'gurufocus_scraper.py → SP500_EY, SP500_PE'],
        pages: ['/economic-indicators/unrate', '/economic-indicators/payems', '/economic-indicators/nfp-change', '/economic-indicators/ic4wsa', '/spread/a-corporate', '/spread/bbb-corporate', '/market/a-effective-yield', '/market/sp500-earnings-yield', '/market/sp500-pe-ratio'],
    },
    {
        table: 'eurodollar_futures', label: 'Eurodollar Futures',
        scrapers: ['eurodollar_scraper.py → Investing.com (snapshot)'],
        pages: ['/interest-rate/eurodollar-futures'],
    },
    {
        table: 'cme_fedwatch', label: 'CME FedWatch',
        scrapers: ['cmefedwatch_scraper.py → CME Group (snapshot)'],
        pages: ['/interest-rate/cme-fedwatch'],
    },
];

export default function AdminDashboard() {
    const [statuses, setStatuses] = useState<Record<string, Status>>({});
    const [tab, setTab] = useState<'schedule' | 'pipeline'>('schedule');

    const run = async (id: string, url: string, msg: string) => {
        setStatuses(s => ({ ...s, [id]: 'running' }));
        try {
            const res = await triggerScraperAction(url);
            if (!res.success) { setStatuses(s => ({ ...s, [id]: 'error' })); alert(`Error: ${res.error}`); return; }
            setStatuses(s => ({ ...s, [id]: 'success' }));
            alert(msg);
        } catch (e) { setStatuses(s => ({ ...s, [id]: 'error' })); alert(`Error: ${e}`); }
    };

    const dot = (id: string) => {
        const s = statuses[id];
        const cls = s === 'running'
            ? 'bg-amber-400 animate-pulse shadow-sm shadow-amber-300'
            : s === 'success'
                ? 'bg-emerald-500 shadow-sm shadow-emerald-300'
                : s === 'error'
                    ? 'bg-red-400 shadow-sm shadow-red-300'
                    : 'bg-slate-300';
        return <span className={`inline-block w-2 h-2 rounded-full ${cls} shrink-0 mt-0.5`} />;
    };

    const sections = [
        {
            key: 'daily' as const,
            label: 'Daily',
            icon: '📅',
            accent: 'emerald',
            desc: 'Run every business day',
            headerBg: 'bg-emerald-50',
            headerBorder: 'border-emerald-100',
            headerText: 'text-emerald-700',
            btnCls: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
            tagCls: 'bg-emerald-100 text-emerald-700',
        },
        {
            key: 'weekly' as const,
            label: 'Weekly',
            icon: '📆',
            accent: 'amber',
            desc: 'Run on specific day each week',
            headerBg: 'bg-amber-50',
            headerBorder: 'border-amber-100',
            headerText: 'text-amber-700',
            btnCls: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
            tagCls: 'bg-amber-100 text-amber-700',
        },
        {
            key: 'monthly' as const,
            label: 'Monthly',
            icon: '🗓️',
            accent: 'blue',
            desc: 'Run once a month on release day',
            headerBg: 'bg-blue-50',
            headerBorder: 'border-blue-100',
            headerText: 'text-blue-700',
            btnCls: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
            tagCls: 'bg-blue-100 text-blue-700',
        },
    ];

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

                {/* Header */}
                <div className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold shadow">A</div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                                <p className="text-xs text-slate-400 mt-0.5">Scraper management &amp; data pipeline</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/reports"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                            >
                                📁 Manage Reports
                            </Link>
                            <Link
                                href="/admin/users"
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition shadow-sm"
                            >
                                👤 Manage Users
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-7">

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-8 shadow-sm">
                        {[
                            { key: 'schedule', label: '📋 Schedule — What to Run & When' },
                            { key: 'pipeline', label: '🔄 Data Pipeline — Who Feeds Who' },
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key as any)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === t.key
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Schedule Tab ── */}
                    {tab === 'schedule' && (
                        <div className="space-y-6">
                            {sections.map(sec => (
                                <div key={sec.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Section header */}
                                    <div className={`px-6 py-4 border-b ${sec.headerBorder} ${sec.headerBg} flex items-center gap-3`}>
                                        <span className="text-xl">{sec.icon}</span>
                                        <div>
                                            <h2 className={`text-base font-bold ${sec.headerText}`}>{sec.label}</h2>
                                            <p className="text-xs text-slate-400">{sec.desc}</p>
                                        </div>
                                        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${sec.tagCls}`}>
                                            {SCHEDULE[sec.key].length} scraper{SCHEDULE[sec.key].length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Cards grid */}
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {SCHEDULE[sec.key].map((s: any) => {
                                            const st = statuses[s.id];
                                            return (
                                                <div
                                                    key={s.id}
                                                    className="bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-md rounded-xl p-4 flex flex-col transition-all duration-200"
                                                >
                                                    {/* Title row */}
                                                    <div className="flex items-start gap-2 mb-1.5">
                                                        {dot(s.id)}
                                                        <h3 className="font-semibold text-sm text-slate-800 leading-tight">{s.title}</h3>
                                                        {s.snapshot && (
                                                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-500 font-semibold uppercase tracking-wide shrink-0">
                                                                Snapshot
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Meta */}
                                                    <p className="text-[11px] text-slate-400 mb-0.5">
                                                        <span className="font-medium text-slate-500">{s.source}</span>
                                                        {' · '}
                                                        <code className="font-mono text-slate-400">{s.file}</code>
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mb-3">
                                                        🕒 {s.when}
                                                        {s.note && (
                                                            <span className="ml-1.5 text-amber-600 font-medium">· {s.note}</span>
                                                        )}
                                                    </p>

                                                    {/* Status bar */}
                                                    {st && st !== 'idle' && (
                                                        <div className={`text-[10px] font-semibold rounded-md px-2 py-1 mb-2 text-center ${st === 'running' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                            st === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                                'bg-red-50 text-red-500 border border-red-200'
                                                            }`}>
                                                            {st === 'running' ? '⏳ Running…' : st === 'success' ? '✅ Completed' : '❌ Failed'}
                                                        </div>
                                                    )}

                                                    {/* Run button */}
                                                    <div className="mt-auto">
                                                        <button
                                                            onClick={() => run(s.id, s.url, s.msg)}
                                                            disabled={st === 'running'}
                                                            className={`w-full ${sec.btnCls} text-white py-1.5 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed`}
                                                        >
                                                            {st === 'running' ? '⏳ Running…' : '▶ Run Now'}
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

                    {/* ── Pipeline Tab ── */}
                    {tab === 'pipeline' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 mb-4">
                                Each row shows:{' '}
                                <span className="text-emerald-600 font-semibold">Scrapers</span>
                                {' → '}
                                <span className="text-blue-600 font-semibold">DB Table</span>
                                {' → '}
                                <span className="text-violet-600 font-semibold">Frontend Pages</span>
                            </p>

                            {PIPELINES.map(p => (
                                <div key={p.table} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_32px_180px_32px_1fr] gap-4 items-start">

                                        {/* Scrapers */}
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Scrapers</p>
                                            <div className="space-y-1.5">
                                                {p.scrapers.map((s, i) => (
                                                    <div key={i} className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-700 font-mono">
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden lg:flex items-center justify-center text-slate-300 text-xl pt-6">→</div>

                                        {/* DB Table */}
                                        <div className="flex flex-col items-center">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">DB Table</p>
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center w-full">
                                                <p className="text-sm font-bold text-blue-700 font-mono">{p.table}</p>
                                                <p className="text-[10px] text-blue-400 mt-0.5">{p.label}</p>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden lg:flex items-center justify-center text-slate-300 text-xl pt-6">→</div>

                                        {/* Pages */}
                                        <div>
                                            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-2">Frontend Pages</p>
                                            <div className="space-y-1">
                                                {p.pages.map((pg, i) => (
                                                    <div key={i} className="text-[11px] bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5 text-violet-700 font-mono">
                                                        {pg}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {p.warn && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                                            <span className="text-amber-500 text-sm">⚠️</span>
                                            <p className="text-[11px] text-amber-600 font-medium">{p.warn}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-amber-700 mb-3">📌 Important Notes</h3>
                        <ul className="text-xs text-amber-700/80 space-y-1.5">
                            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span><b>Snapshot</b> scrapers (Eurodollar, FedWatch) capture current data only — no historical backfill possible.</span></li>
                            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span><b>Treasury</b> scrapers (FRED + Gov) both write to <b>treasury_yield_curves</b>. Treasury.gov is faster.</span></li>
                            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span><b>Credit Spreads</b> (BAMLC0A3CA, BAMLC0A4CBBB, BAMLC0A3CAEY) are <b>daily</b> data from FRED.</span></li>
                            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span><b>GuruFocus</b> scrapers use Selenium — may take 30–60s. Incremental mode scrapes last 3 pages (≈ 2 months).</span></li>
                            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span><b>S&P 500 PE</b>: GuruFocus feeds the main chart page; Multpl updates the PE column in the History table (used for Yield Curve).</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}