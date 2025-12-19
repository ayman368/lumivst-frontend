export interface ColumnDef {
    key: string;
    label: string;
    sortable: boolean;
    align?: 'left' | 'right' | 'center';
}

export const TABLE_COLUMNS: ColumnDef[] = [
    { key: 'symbol', label: 'Symbol', sortable: true, align: 'left' },
    { key: 'price', label: 'Price', sortable: true, align: 'right' },
    { key: 'change', label: 'Change %', sortable: true, align: 'right' },
    { key: 'changeAmount', label: 'Change', sortable: true, align: 'right' },
    { key: 'volume', label: 'Volume', sortable: true, align: 'right' },
    { key: 'marketCap', label: 'Market Cap', sortable: true, align: 'right' },
    { key: 'peRatio', label: 'P/E', sortable: true, align: 'right' },
    { key: 'sector', label: 'Sector', sortable: true, align: 'left' },
    { key: 'analystRating', label: 'Analyst Rating', sortable: false, align: 'center' },
];
