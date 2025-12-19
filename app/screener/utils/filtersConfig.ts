export interface FilterConfig {
    id: string;
    label: string;
    type: 'select' | 'range' | 'text';
    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
}

export const FILTERS_CONFIG: FilterConfig[] = [
    {
        id: 'marketCap',
        label: 'Market Cap',
        type: 'select',
        options: [
            { value: 'all', label: 'All' },
            { value: 'mega', label: 'Mega ($200B+)' },
            { value: 'large', label: 'Large ($10B - $200B)' },
            { value: 'mid', label: 'Mid ($2B - $10B)' },
            { value: 'small', label: 'Small ($300M - $2B)' },
            { value: 'micro', label: 'Micro ($50M - $300M)' },
            { value: 'nano', label: 'Nano (<$50M)' },
        ],
    },
    {
        id: 'price',
        label: 'Price',
        type: 'range',
        min: 0,
        max: 5000,
    },
    {
        id: 'change',
        label: 'Change %',
        type: 'select',
        options: [
            { value: 'all', label: 'All' },
            { value: 'up', label: 'Up' },
            { value: 'down', label: 'Down' },
            { value: 'up_10', label: 'Up > 10%' },
            { value: 'down_10', label: 'Down > 10%' },
        ]
    },
    {
        id: 'sector',
        label: 'Sector',
        type: 'select',
        options: [
            { value: 'all', label: 'All' },
            { value: 'Technology', label: 'Technology' },
            { value: 'Financial', label: 'Financial' },
            { value: 'Consumer Cyclical', label: 'Consumer Cyclical' },
            { value: 'Healthcare', label: 'Healthcare' },
            { value: 'Energy', label: 'Energy' },
        ]
    }
];
