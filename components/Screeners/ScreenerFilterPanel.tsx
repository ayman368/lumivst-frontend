'use client';
import React, { useState, useEffect } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface ScreenerFilters {
    price_min: string; price_max: string;
    sma_50_min: string; sma_50_max: string;
    sma_150_min: string; sma_150_max: string;
    sma_200_min: string; sma_200_max: string;
    rs_12m_min: string; rs_12m_max: string;
    rank_1m_min: string; rank_1m_max: string;
    rank_3m_min: string; rank_3m_max: string;
    rank_6m_min: string; rank_6m_max: string;
    rank_9m_min: string; rank_9m_max: string;
    rank_12m_min: string; rank_12m_max: string;
    percent_off_52w_high_min: string; percent_off_52w_high_max: string;
    percent_off_52w_low_min: string; percent_off_52w_low_max: string;
}

export const initialScreenerFilters: ScreenerFilters = {
    price_min: '', price_max: '',
    sma_50_min: '', sma_50_max: '',
    sma_150_min: '', sma_150_max: '',
    sma_200_min: '', sma_200_max: '',
    rs_12m_min: '', rs_12m_max: '',
    rank_1m_min: '', rank_1m_max: '',
    rank_3m_min: '', rank_3m_max: '',
    rank_6m_min: '', rank_6m_max: '',
    rank_9m_min: '', rank_9m_max: '',
    rank_12m_min: '', rank_12m_max: '',
    percent_off_52w_high_min: '', percent_off_52w_high_max: '',
    percent_off_52w_low_min: '', percent_off_52w_low_max: '',
};

/* ─── Stepper Input ──────────────────────────────────────────────────────── */

function StepperInput({ value, onChange, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    const [local, setLocal] = useState(value);
    useEffect(() => setLocal(value), [value]);

    const commit = (val: string) => { if (val !== value) onChange(val); };
    const step = (dir: number) => {
        const next = String((parseFloat(local) || 0) + dir);
        setLocal(next); onChange(next);
    };

    const active = value !== '';
    const btnCls = `w-[18px] h-[20px] flex items-center justify-center text-[12px] font-bold
        select-none transition-colors leading-none rounded-sm
        ${active ? 'text-[#2563EB] hover:bg-blue-50' : 'text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F9FAFB]'}`;

    return (
        <div className="flex items-center gap-[1px]">
            <button type="button" onClick={() => step(-1)} className={btnCls}>−</button>
            <input
                type="number"
                value={local}
                placeholder={placeholder}
                onChange={e => setLocal(e.target.value)}
                onBlur={e => commit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                className={`w-[44px] h-[20px] text-center text-[11px] font-medium border rounded outline-none transition-colors
                    [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                    placeholder:text-[#D1D5DB]
                    ${active
                        ? 'border-[#93C5FD] bg-[#EFF6FF] text-[#1E40AF]'
                        : 'border-[#E5E7EB] bg-white text-[#374151] focus:border-[#93C5FD] focus:bg-[#EFF6FF]'
                    }`}
                step="any"
            />
            <button type="button" onClick={() => step(1)} className={btnCls}>+</button>
        </div>
    );
}

/* ─── Range Row ──────────────────────────────────────────────────────────── */

function RangeRow({ label, minVal, maxVal, onMinChange, onMaxChange }: {
    label: string; minVal: string; maxVal: string;
    onMinChange: (v: string) => void; onMaxChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 h-[28px]">
            <span className="w-[100px] shrink-0 text-[11px] text-[#374151] font-medium">{label}</span>
            <StepperInput value={minVal} onChange={onMinChange} placeholder="Min" />
            <span className="text-[10px] text-[#9CA3AF]">to</span>
            <StepperInput value={maxVal} onChange={onMaxChange} placeholder="Max" />
        </div>
    );
}

/* ─── Section ────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex-1 min-w-[260px]">
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#6B7280] mb-1.5 pb-1 border-b border-[#F3F4F6]">
                {title}
            </p>
            <div className="flex flex-col">{children}</div>
        </div>
    );
}

/* ─── Main Panel ─────────────────────────────────────────────────────────── */

interface ScreenerFilterPanelProps {
    filters: ScreenerFilters;
    setFilters: React.Dispatch<React.SetStateAction<ScreenerFilters>>;
    clearAllFilters: () => void;
}

export default function ScreenerFilterPanel({ filters, setFilters, clearAllFilters }: ScreenerFilterPanelProps) {

    const set = <K extends keyof ScreenerFilters>(key: K, val: string) =>
        setFilters(p => ({ ...p, [key]: val }));

    const activeCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-6 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#F3F4F6] bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#111827]">Screener Filters</span>
                    {activeCount > 0 && (
                        <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <button onClick={clearAllFilters}
                        className="text-[11px] font-medium text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter body */}
            <div className="p-4 overflow-x-auto">
                <div className="flex gap-5 min-w-max">

                    {/* ── PRICE ── */}
                    <Section title="Price">
                        <RangeRow label="Price"
                            minVal={filters.price_min} maxVal={filters.price_max}
                            onMinChange={v => set('price_min', v)} onMaxChange={v => set('price_max', v)} />
                        <RangeRow label="RS Rating"
                            minVal={filters.rs_12m_min} maxVal={filters.rs_12m_max}
                            onMinChange={v => set('rs_12m_min', v)} onMaxChange={v => set('rs_12m_max', v)} />
                    </Section>

                    <div className="w-px self-stretch bg-[#F3F4F6]" />

                    {/* ── RELATIVE STRENGTH ── */}
                    <Section title="Relative Strength">
                        <RangeRow label="RS 1M"
                            minVal={filters.rank_1m_min} maxVal={filters.rank_1m_max}
                            onMinChange={v => set('rank_1m_min', v)} onMaxChange={v => set('rank_1m_max', v)} />
                        <RangeRow label="RS 3M"
                            minVal={filters.rank_3m_min} maxVal={filters.rank_3m_max}
                            onMinChange={v => set('rank_3m_min', v)} onMaxChange={v => set('rank_3m_max', v)} />
                        <RangeRow label="RS 6M"
                            minVal={filters.rank_6m_min} maxVal={filters.rank_6m_max}
                            onMinChange={v => set('rank_6m_min', v)} onMaxChange={v => set('rank_6m_max', v)} />
                        <RangeRow label="RS 9M"
                            minVal={filters.rank_9m_min} maxVal={filters.rank_9m_max}
                            onMinChange={v => set('rank_9m_min', v)} onMaxChange={v => set('rank_9m_max', v)} />
                        <RangeRow label="RS 12M"
                            minVal={filters.rank_12m_min} maxVal={filters.rank_12m_max}
                            onMinChange={v => set('rank_12m_min', v)} onMaxChange={v => set('rank_12m_max', v)} />
                    </Section>

                    <div className="w-px self-stretch bg-[#F3F4F6]" />

                    {/* ── SMA ── */}
                    <Section title="SMA">
                        <RangeRow label="SMA 50"
                            minVal={filters.sma_50_min} maxVal={filters.sma_50_max}
                            onMinChange={v => set('sma_50_min', v)} onMaxChange={v => set('sma_50_max', v)} />
                        <RangeRow label="SMA 150"
                            minVal={filters.sma_150_min} maxVal={filters.sma_150_max}
                            onMinChange={v => set('sma_150_min', v)} onMaxChange={v => set('sma_150_max', v)} />
                        <RangeRow label="SMA 200"
                            minVal={filters.sma_200_min} maxVal={filters.sma_200_max}
                            onMinChange={v => set('sma_200_min', v)} onMaxChange={v => set('sma_200_max', v)} />
                    </Section>

                    <div className="w-px self-stretch bg-[#F3F4F6]" />

                    {/* ── 52 WEEK ── */}
                    <Section title="52 Week">
                        <RangeRow label="Off 52W High"
                            minVal={filters.percent_off_52w_high_min} maxVal={filters.percent_off_52w_high_max}
                            onMinChange={v => set('percent_off_52w_high_min', v)} onMaxChange={v => set('percent_off_52w_high_max', v)} />
                        <RangeRow label="Off 52W Low"
                            minVal={filters.percent_off_52w_low_min} maxVal={filters.percent_off_52w_low_max}
                            onMinChange={v => set('percent_off_52w_low_min', v)} onMaxChange={v => set('percent_off_52w_low_max', v)} />
                    </Section>

                </div>
            </div>
        </div>
    );
}