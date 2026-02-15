import React from 'react';

type Props = { value?: string };

export default function RatingBadge({ value }: Props) {
    if (!value || value === 'N/A') return <span className="text-gray-300">-</span>;

    let bg = 'bg-gray-100';
    let color = 'text-gray-700';
    let border = 'border-gray-200';

    if (value.startsWith('A')) { bg = 'bg-green-100'; color = 'text-green-800'; border = 'border-green-200'; }
    else if (value.startsWith('B')) { bg = 'bg-blue-100'; color = 'text-blue-800'; border = 'border-blue-200'; }
    else if (value.startsWith('C')) { bg = 'bg-yellow-100'; color = 'text-yellow-800'; border = 'border-yellow-200'; }
    else if (value.startsWith('D')) { bg = 'bg-orange-100'; color = 'text-orange-800'; border = 'border-orange-200'; }
    else if (value.startsWith('E')) { bg = 'bg-red-100'; color = 'text-red-800'; border = 'border-red-200'; }

    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${bg} ${color} border ${border} min-w-6 text-center`}>
            {value}
        </span>
    );
}
