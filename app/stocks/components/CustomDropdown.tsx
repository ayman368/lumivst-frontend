import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function CustomDropdown({
    options,
    value,
    onChange,
    placeholder,
    icon: Icon
}: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    icon?: any;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(search.toLowerCase())
    );

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
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-10 pr-8 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                    outline-none transition-all hover:border-gray-300 text-left
                    flex items-center justify-between
                `}
            >
                <div className="flex items-center">
                    {Icon && <Icon className="absolute left-3 w-4 h-4 text-gray-400" />}
                    <span className="truncate">
                        {value || placeholder}
                    </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
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
                    <div className="overflow-y-auto max-h-48 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            <>
                                <button
                                    onClick={() => {
                                        onChange('');
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100
                                        ${!value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                                    `}
                                >
                                    {placeholder}
                                </button>
                                {filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            onChange(option === value ? '' : option);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full px-3 py-2 text-left text-sm hover:bg-gray-50
                                            ${option === value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                                        `}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
