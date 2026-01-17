'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Calendar, Search, Loader2, FolderOpen, Building2 } from 'lucide-react';

interface ExcelReport {
    id: number;
    company_symbol: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    description: string | null;
    uploaded_at: string;
    download_url: string;
}

interface Company {
    id: number;
    symbol: string;
    name_en: string | null;
    name_ar: string | null;
}

export default function DashboardReportsPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>('');
    const [reports, setReports] = useState<ExcelReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setCompaniesLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/scraper/companies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch companies');
            const data = await res.json();
            setCompanies(data);
            if (data.length > 0 && !selectedSymbol) {
                setSelectedSymbol(data[0].symbol);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCompaniesLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSymbol) {
            fetchReports(selectedSymbol);
        }
    }, [selectedSymbol]);

    const fetchReports = async (symbol: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/scraper/excel-reports/${symbol}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const data = await res.json();
            setReports(data.reports || []);
        } catch (err: any) {
            setError(err.message);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (report: ExcelReport) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}${report.download_url}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = report.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err: any) {
            alert('Failed to download file: ' + err.message);
        }
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateStr: string): string => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.name_en && c.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FolderOpen className="w-7 h-7 text-green-600" />
                                Excel Reports
                            </h1>
                            <p className="text-gray-500 mt-1">ملفات Excel المحفوظة من السكريب</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <select
                                value={selectedSymbol}
                                onChange={(e) => setSelectedSymbol(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[200px]"
                            >
                                {filteredCompanies.map(company => (
                                    <option key={company.symbol} value={company.symbol}>
                                        {company.symbol} - {company.name_en || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {companiesLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companies</h3>
                        <p className="text-gray-500">Run the scraper first.</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-lg p-6 text-center text-red-600">
                        <p>{error}</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                        <p className="text-gray-500">No Excel files have been uploaded for {selectedSymbol}.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="font-semibold text-gray-900">
                                {reports.length} Excel {reports.length === 1 ? 'Report' : 'Reports'} for {selectedSymbol}
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{report.file_name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(report.uploaded_at)}
                                                </span>
                                                <span>{formatFileSize(report.file_size)}</span>
                                            </div>
                                            {report.description && (
                                                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(report)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
