import React from 'react';
import * as XLSX from 'xlsx';
import type { Stock } from '../types';

export default function ExportMenu({
    show,
    onExport,
    onClose,
    filteredStocks
}: {
    show: boolean;
    onExport: (format: 'csv' | 'xls' | 'xlsx' | 'txt') => void;
    onClose: () => void;
    filteredStocks: Stock[];
}) {
    if (!show) return null;

    return (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg z-[110] border border-gray-200 py-1">
            <button
                onClick={() => { onExport('csv'); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>comma delimited (.csv)</span>
            </button>
            <button
                onClick={() => { onExport('xls'); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>excel 97-2003 (.xls)</span>
            </button>
            <button
                onClick={() => { onExport('xlsx'); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>excel (.xlsx)</span>
            </button>
            <button
                onClick={() => { onExport('txt'); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                <span>Text (.txt)</span>
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
                onClick={() => {
                    // Export TradingView symbols into a CSV file (one symbol per row)
                    const symbols = filteredStocks
                        .map(s => s.trading_view_symbol)
                        .filter(Boolean);

                    // Create simple CSV content manually to ensure correct format
                    const csvContent = "TradingView Symbol\n" + symbols.join("\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);

                    link.setAttribute("href", url);
                    link.setAttribute("download", `TradingView_Symbols_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>TradingView Symbol (.csv)</span>
            </button>
        </div>
    );
}
