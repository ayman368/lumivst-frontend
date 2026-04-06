"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface ExportDropdownProps {
  data: any[];
  filename: string;
  headers: { label: string; key: string }[];
}

export function ExportDropdown({ data, filename, headers }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prepareData = () => {
    return data.map(row => {
      const newRow: any = {};
      headers.forEach(h => {
        newRow[h.label] = row[h.key];
      });
      return newRow;
    });
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(prepareData());
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveFile(blob, `${filename}.csv`);
    setIsOpen(false);
  };

  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(prepareData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveFile(blob, `${filename}.xlsx`);
    setIsOpen(false);
  };

  const exportToTXT = () => {
    const worksheet = XLSX.utils.json_to_sheet(prepareData());
    const txt = XLSX.utils.sheet_to_txt(worksheet);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    saveFile(blob, `${filename}.txt`);
    setIsOpen(false);
  };

  const saveFile = (blob: Blob, fullFilename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fullFilename.split('.')[0]}_${new Date().toISOString().split('T')[0]}.${fullFilename.split('.')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm text-sm font-medium group"
      >
        <svg 
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M7 10l5 5 5-5" />
        </svg>
        <span>Export Data</span>
        <div className="w-px h-4 bg-gray-200 mx-1 group-hover:bg-blue-200"></div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Format</div>
          
          <button
            onClick={exportToCSV}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            <span className="flex-1 text-left font-medium">Comma Delimited (.csv)</span>
          </button>

          <button
            onClick={exportToXLSX}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
            <span className="flex-1 text-left font-medium">Excel File (.xlsx)</span>
          </button>

          <button
            onClick={exportToTXT}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.4)]"></div>
            <span className="flex-1 text-left font-medium">Text Document (.txt)</span>
          </button>
        </div>
      )}
    </div>
  );
}
