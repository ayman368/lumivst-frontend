import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function CustomMultiSelect({
    options,
    selected,
    onChange,
    placeholder,
    icon: Icon
}: {
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    icon?: any;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleClearAll = () => {
        onChange([]);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-10 pr-8 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                    outline-none transition-all hover:border-gray-300 text-left
                    flex items-center justify-between min-h-[42px]
                `}
            >
                <div className="flex items-center w-full">
                    {Icon && <Icon className="absolute left-3 w-4 h-4 text-gray-400" />}
                    <div className="flex flex-col items-start truncate w-full">
                        <span className="font-medium text-gray-700 text-xs">
                            {placeholder}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selected.length === 0 ? (
                                <span className="text-gray-400 text-xs">All {placeholder}</span>
                            ) : (
                                <>
                                    {selected.slice(0, 2).map((item) => (
                                        <span
                                            key={item}
                                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                    {selected.length > 2 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                            +{selected.length - 2} more
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen ? (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-700">
                                Selected: {selected.length}
                            </span>
                            {selected.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-xs text-red-600 hover:text-red-800"
                                >
                                    Clear All
                                </button>
                            ) : null}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-60 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            <>
                                {filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center
                                            ${selected.includes(option)
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center w-full">
                                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center
                                                ${selected.includes(option)
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-gray-300'
                                                }
                                            `}>
                                                {selected.includes(option) ? (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : null}
                                            </div>
                                            <span className="truncate">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No options found</div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
