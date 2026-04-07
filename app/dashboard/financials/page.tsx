'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown, Search, Download, RefreshCcw, Loader2, FileSpreadsheet, Building2 } from 'lucide-react';
import { StocksTopBar } from '../../stocks/_components/StocksTopBar';
import { StockHeader } from '../../stocks/_components/StockHeader';
import { StockTabs } from '../../stocks/_components/StockTabs';
import { MOCK_STOCK_DATA } from '../../stocks/data/mockData';

interface FinancialPeriod {
    period_end_date: string;
    period_type: 'Annually' | 'Quarterly';
    metrics: Record<string, string>;
}

interface HistoricalFinancials {
    symbol: string;
    company_name: string | null;
    balance_sheets: FinancialPeriod[];
    income_statements: FinancialPeriod[];
    cash_flows: FinancialPeriod[];
}

interface Company {
    id: number;
    symbol: string;
    name_en: string | null;
    name_ar: string | null;
    sector: string | null;
    last_scraped_at: string | null;
}

type ReportType = 'balance_sheets' | 'income_statements' | 'cash_flows';
type PeriodType = 'Annually' | 'Quarterly';

function DashboardFinancialsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlSymbol = searchParams.get('symbol');

    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>(urlSymbol || '');
    const [financialData, setFinancialData] = useState<HistoricalFinancials | null>(null);
    const [activeReportType, setActiveReportType] = useState<ReportType>('income_statements');
    const [periodType, setPeriodType] = useState<PeriodType>('Annually');
    const [loading, setLoading] = useState(false);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Sync URL symbol with state
    useEffect(() => {
        if (urlSymbol) {
            setSelectedSymbol(urlSymbol);
        }
    }, [urlSymbol]);

    // Fetch companies on mount
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setCompaniesLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/scraper/companies`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch companies');
            const data = await res.json();
            setCompanies(data);

            // If no symbol in URL, default to first company
            if (data.length > 0 && !urlSymbol && !selectedSymbol) {
                const firstSym = data[0].symbol;
                setSelectedSymbol(firstSym);
                router.replace(`/dashboard/financials?symbol=${firstSym}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCompaniesLoading(false);
        }
    };

    // Fetch financials when symbol changes
    useEffect(() => {
        if (selectedSymbol) {
            fetchFinancials(selectedSymbol);
        }
    }, [selectedSymbol]);

    const fetchFinancials = async (symbol: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/scraper/financials/${symbol}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch financial data');
            const data = await res.json();
            setFinancialData(data);
        } catch (err: any) {
            setError(err.message);
            setFinancialData(null);
        } finally {
            setLoading(false);
        }
    };

    // Filter companies by search
    const filteredCompanies = companies.filter(c =>
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.name_en && c.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.name_ar && c.name_ar.includes(searchQuery))
    );

    // Get current report data
    const getCurrentReportData = (): FinancialPeriod[] => {
        if (!financialData) return [];
        const data = financialData[activeReportType] || [];
        return data.filter(p => p.period_type === periodType);
    };

    const reportData = getCurrentReportData();

    // Get unique metric names across all periods
    const getAllMetricNames = (): string[] => {
        const metrics = new Set<string>();
        reportData.forEach(period => {
            Object.keys(period.metrics).forEach(key => metrics.add(key));
        });
        return Array.from(metrics).sort();
    };

    const metricNames = getAllMetricNames();
    const periods = reportData.map(p => p.period_end_date).sort().reverse();

    const reportTabs = [
        { key: 'income_statements', label: 'Income Statement', labelAr: 'قائمة الدخل' },
        { key: 'balance_sheets', label: 'Balance Sheet', labelAr: 'الميزانية العمومية' },
        { key: 'cash_flows', label: 'Cash Flows', labelAr: 'التدفقات النقدية' },
    ];

    // Find current company name
    const currentCompany = companies.find(c => c.symbol === selectedSymbol);
    const displayName = currentCompany ? (currentCompany.name_en || currentCompany.name_ar || 'Unknown') : selectedSymbol;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Replacement */}
            <div>
                <Suspense fallback={<div className="bg-white border-b border-gray-200 px-6 py-3 h-14 animate-pulse" />}>
                    <StocksTopBar />
                </Suspense>
                {selectedSymbol && (
                    <StockHeader
                        symbol={selectedSymbol}
                        name={displayName}
                        price={MOCK_STOCK_DATA.price}
                        change={MOCK_STOCK_DATA.change}
                        changePercent={MOCK_STOCK_DATA.changePercent}
                        marketTime={MOCK_STOCK_DATA.marketTime}
                        exchange={MOCK_STOCK_DATA.exchange}
                        currency={MOCK_STOCK_DATA.currency}
                    />
                )}
                {selectedSymbol && (
                    <StockTabs symbol={selectedSymbol} />
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {companiesLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companies Found</h3>
                        <p className="text-gray-500">Run the scraper to populate company data.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Report Type Tabs */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex border-b border-gray-200">
                                {reportTabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveReportType(tab.key as ReportType)}
                                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeReportType === tab.key
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}

                                {/* Period Toggle */}
                                <div className="ml-auto flex items-center px-4 gap-2">
                                    <span className="text-sm text-gray-500">Period:</span>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setPeriodType('Annually')}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${periodType === 'Annually'
                                                ? 'bg-white shadow text-gray-900'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Annual
                                        </button>
                                        <button
                                            onClick={() => setPeriodType('Quarterly')}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${periodType === 'Quarterly'
                                                ? 'bg-white shadow text-gray-900'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Quarterly
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Table Content */}
                            <div className="p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12 text-red-500">
                                        <p>{error}</p>
                                        <button
                                            onClick={() => selectedSymbol && fetchFinancials(selectedSymbol)}
                                            className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : periods.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No {periodType.toLowerCase()} data available for this report type.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 min-w-[250px]">
                                                        Metric
                                                    </th>
                                                    {periods.map(period => (
                                                        <th key={period} className="py-3 px-4 text-right font-semibold text-gray-900 min-w-[120px] whitespace-nowrap">
                                                            {period}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {metricNames.map((metricName, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 font-medium text-gray-900 sticky left-0 bg-white">
                                                            {metricName}
                                                        </td>
                                                        {periods.map(period => {
                                                            const periodData = reportData.find(p => p.period_end_date === period);
                                                            const value = periodData?.metrics[metricName] || '-';
                                                            return (
                                                                <td key={period} className="py-3 px-4 text-right text-gray-600 tabular-nums">
                                                                    {value}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Info Card */}
                        {financialData && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">{financialData.symbol}</span>
                                    {financialData.company_name && (
                                        <span>{financialData.company_name}</span>
                                    )}
                                    <span className="text-gray-400">|</span>
                                    <span>Balance Sheets: {financialData.balance_sheets.length}</span>
                                    <span>Income Statements: {financialData.income_statements.length}</span>
                                    <span>Cash Flows: {financialData.cash_flows.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardFinancialsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <DashboardFinancialsContent />
        </Suspense>
    );
}
