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
    onExport: (format: 'csv'|'xls'|'xlsx'|'txt') => void;
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
                    // Export TradingView symbols into an Excel file (one symbol per row)
                    const symbols = filteredStocks
                        .map(s => s.trading_view_symbol)
                        .filter(Boolean);
                    const wsData = symbols.map(s => [s]);
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.aoa_to_sheet([["TradingView Symbol"], ...wsData]);
                    XLSX.utils.book_append_sheet(wb, ws, 'Symbols');
                    const filename = `TradingView_Symbols_${new Date().toISOString().split('T')[0]}.xlsx`;
                    XLSX.writeFile(wb, filename);
                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>TradingView Symbols (.xlsx)</span>
            </button>
        </div>
    );
}
