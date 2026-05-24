export function buildShariahMap(
    prices: { symbol: string; approval_with_controls?: string | null }[]
): { bySymbol: Map<string, string>; options: string[] } {
    const bySymbol = new Map<string, string>();
    const optionsSet = new Set<string>();

    for (const item of prices) {
        const symbol = String(item.symbol).trim();
        const status = item.approval_with_controls;
        if (!symbol || !status || typeof status !== 'string' || status === '-') continue;
        bySymbol.set(symbol, status);
        optionsSet.add(status);
    }

    return {
        bySymbol,
        options: Array.from(optionsSet).sort(),
    };
}

export function applyShariahFilter<T extends { symbol: string }>(
    items: T[],
    bySymbol: Map<string, string>,
    selected: string[]
): T[] {
    if (selected.length === 0) return items;
    return items.filter((item) => {
        const status = bySymbol.get(String(item.symbol)) || '';
        return selected.includes(status);
    });
}
