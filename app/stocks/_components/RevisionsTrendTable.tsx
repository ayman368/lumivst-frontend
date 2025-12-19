export function RevisionsTrendTable({ rows, valuePrefix = '' }: any) {
    if (!rows) return null;

    // Helper to determine color based on trend string (simple heuristic)
    const getTrendColor = (val: string) => {
        if (!val) return 'text-gray-900';
        if (val === '0.00%') return 'text-blue-500'; // Or gray? Image shows blueish.
        return 'text-green-600'; // Assuming mostly positive in mock
    };

    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="text-gray-500 font-bold border-b border-gray-200">
                        <th className="py-2 pr-4">Fiscal Period Ending</th>
                        <th className="py-2 px-4 text-right">Estimate</th>
                        <th className="py-2 px-4 text-right">YoY Growth</th>
                        <th className="py-2 px-4 text-right">1M Trend</th>
                        <th className="py-2 px-4 text-right">3M Trend</th>
                        <th className="py-2 px-4 text-right">6M Trend</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 font-bold text-gray-900">{row.end}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{row.estimate}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{row.yoy}</td>
                            <td className={`py-3 px-4 text-right font-medium ${getTrendColor(row.trend1m)}`}>{row.trend1m}</td>
                            <td className={`py-3 px-4 text-right font-medium ${getTrendColor(row.trend3m)}`}>{row.trend3m}</td>
                            <td className={`py-3 px-4 text-right font-medium ${getTrendColor(row.trend6m)}`}>{row.trend6m}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
