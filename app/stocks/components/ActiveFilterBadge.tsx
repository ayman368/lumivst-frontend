import React from 'react';

export default function ActiveFilterBadge({
    label,
    value,
    onRemove
}: {
    label: string;
    value: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
            {label}: {value}
            <button
                onClick={onRemove}
                className="ml-1 text-blue-500 hover:text-blue-700"
            >
                ×
            </button>
        </span>
    );
}
