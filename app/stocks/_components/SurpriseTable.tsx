export function SurpriseTable({ rows, type = 'eps', container = true }: { rows: any[], type?: 'eps' | 'revenue', container?: boolean }) {
    if (!rows) return null;

    const estLabel = type === 'eps' ? 'EPS Estimate' : 'Revenue Estimate';
    const actLabel = type === 'eps' ? 'EPS Actual' : 'Revenue Actual';

    // Helper for formatting
    const formatVal = (val: number) => type === 'revenue' ? `$${val}B` : val;
    const formatSurprise = (val: number) => {
        const sign = val > 0 ? '+' : '';
        const pref = type === 'revenue' ? '$' : '';
        const suff = type === 'revenue' ? 'B' : '';
        return `${sign}${pref}${val}${suff}`;
    }

    const containerClasses = container
        ? "overflow-x-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6"
        : "overflow-x-auto mt-6";

    return (
        <div className={containerClasses}>
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="text-gray-500 font-bold border-b border-gray-200">
                        <th className="py-2 pr-4">Earnings Date</th>
                        <th className="py-2 px-4 text-right">{estLabel}</th>
                        <th className="py-2 px-4 text-right">{actLabel}</th>
                        <th className="py-2 px-4 text-right">Surprise</th>
                        <th className="py-2 px-4 text-right">Surprise %</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 font-bold text-gray-900">{row.date}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{formatVal(row.estimate)}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{formatVal(row.actual)}</td>
                            <td className={`py-3 px-4 text-right font-medium ${row.surprise >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatSurprise(row.surprise)}
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${row.surprisePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {row.surprisePercent}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
