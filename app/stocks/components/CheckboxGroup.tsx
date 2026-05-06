import React from 'react';

export default function CheckboxGroup({
    label,
    options,
    selected,
    onChange
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (value: string[]) => void;
}) {
    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="space-y-1">
            <label className="block text-[10px] font-medium text-gray-600">{label}</label>
            <div className="flex flex-wrap gap-1">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => toggleOption(option)}
                        className={`
              px-2 py-1 text-[10px] font-medium rounded transition-colors
              ${selected.includes(option)
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                            }
            `}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}