"use client";

import React, { useState } from 'react';

export type RangeFilter = {
    key: string;
    label: string;
};

export type FilterBarProps = {
    searchKeys?: string[];
    searchPlaceholder?: string;
    rangeFilters?: RangeFilter[];
    onSearchChange: (value: string) => void;
    onRangeChange: (key: string, min: string, max: string) => void;
    searchValue: string;
    rangeValues: Record<string, { min: string; max: string }>;
    onClearAll: () => void;
};

export default function FilterBar({
    searchKeys,
    searchPlaceholder = 'Search by symbol or name...',
    rangeFilters = [],
    onSearchChange,
    onRangeChange,
    searchValue,
    rangeValues,
    onClearAll,
}: FilterBarProps) {
    const hasActiveFilters =
        searchValue.trim() !== '' ||
        Object.values(rangeValues).some((v) => v.min !== '' || v.max !== '');

    return (
        <div className="filter-bar-wrapper mb-6">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .filter-bar-wrapper {
          font-family: 'DM Sans', sans-serif;
        }

        .filter-panel {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          border: 1px solid #dde4f5;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 2px 12px rgba(59, 100, 220, 0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          position: relative;
          overflow: hidden;
        }

        .filter-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b64dc, #6c8ef5, #3b64dc);
          background-size: 200% 100%;
          animation: shimmer 3s ease infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .filter-top-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: ${rangeFilters.length > 0 ? '16px' : '0'};
        }

        .filter-label-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #3b64dc;
          color: white;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .filter-label-badge svg {
          width: 12px; height: 12px;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 380px;
        }

        .search-input-wrapper svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px; height: 15px;
          color: #8a9cc5;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 9px 12px 9px 36px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          background: white;
          border: 1.5px solid #dde4f5;
          border-radius: 10px;
          color: #1e2a4a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input::placeholder { color: #b0bbda; }

        .search-input:focus {
          border-color: #3b64dc;
          box-shadow: 0 0 0 3px rgba(59,100,220,0.12);
        }

        .range-filters-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
        }

        .range-filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 160px;
        }

        .range-filter-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #6b7db3;
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .range-input {
          width: 80px;
          padding: 7px 10px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          background: white;
          border: 1.5px solid #dde4f5;
          border-radius: 8px;
          color: #1e2a4a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          text-align: center;
        }

        .range-input::placeholder { color: #c5cce0; font-size: 11px; }

        .range-input:focus {
          border-color: #3b64dc;
          box-shadow: 0 0 0 3px rgba(59,100,220,0.12);
        }

        .range-sep {
          color: #b0bbda;
          font-size: 11px;
          font-weight: 600;
          padding: 0 2px;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #e05252;
          background: #fff5f5;
          border: 1.5px solid #fac5c5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          margin-left: auto;
        }

        .clear-btn:hover {
          background: #fee2e2;
          border-color: #e05252;
          transform: translateY(-1px);
        }

        .clear-btn svg { width: 12px; height: 12px; }

        .active-dot {
          width: 6px; height: 6px;
          background: #5ddd8a;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(93,221,138,0.3);
          animation: pulse-dot 2s ease infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 2px rgba(93,221,138,0.3); }
          50% { box-shadow: 0 0 0 4px rgba(93,221,138,0.15); }
        }
      `}</style>

            <div className="filter-panel">
                <div className="filter-top-row">
                    <span className="filter-label-badge">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
                        </svg>
                        Filters
                        {hasActiveFilters && <span className="active-dot" />}
                    </span>

                    {searchKeys && searchKeys.length > 0 && (
                        <div className="search-input-wrapper">
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="7" cy="7" r="4.5" />
                                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
                            </svg>
                            <input
                                className="search-input"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}

                    {hasActiveFilters && (
                        <button className="clear-btn" onClick={onClearAll}>
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                            </svg>
                            Clear All
                        </button>
                    )}
                </div>

                {rangeFilters.length > 0 && (
                    <div className="range-filters-grid">
                        {rangeFilters.map((rf) => (
                            <div key={rf.key} className="range-filter-group">
                                <span className="range-filter-label">{rf.label}</span>
                                <div className="range-inputs">
                                    <input
                                        className="range-input"
                                        placeholder="Min"
                                        value={rangeValues[rf.key]?.min ?? ''}
                                        onChange={(e) =>
                                            onRangeChange(rf.key, e.target.value, rangeValues[rf.key]?.max ?? '')
                                        }
                                    />
                                    <span className="range-sep">→</span>
                                    <input
                                        className="range-input"
                                        placeholder="Max"
                                        value={rangeValues[rf.key]?.max ?? ''}
                                        onChange={(e) =>
                                            onRangeChange(rf.key, rangeValues[rf.key]?.min ?? '', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}