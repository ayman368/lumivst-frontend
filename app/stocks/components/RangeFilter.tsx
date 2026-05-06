import React from 'react';

export default function RangeFilter({
    label,
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
    minPlaceholder = "Min",
    maxPlaceholder = "Max"
}: {
    label: string;
    minValue: string;
    maxValue: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    minPlaceholder?: string;
    maxPlaceholder?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="block text-[10px] font-medium text-gray-600">{label}</label>
            <div className="flex space-x-2">
                <input
                    type="number"
                    placeholder={minPlaceholder}
                    value={minValue}
                    onChange={(e) => onMinChange(e.target.value)}
                    className="w-full px-2 py-1 text-[10px] bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
                <span className="self-center text-[10px] text-gray-400">-</span>
                <input
                    type="number"
                    placeholder={maxPlaceholder}
                    value={maxValue}
                    onChange={(e) => onMaxChange(e.target.value)}
                    className="w-full px-2 py-1 text-[10px] bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
            </div>
        </div>
    );
}