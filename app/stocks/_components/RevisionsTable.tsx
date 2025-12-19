export function RevisionsTable({ data, symbol }: any) {
    if (!data) return null;

    // Helper to determine color for percentage diffs
    const getColor = (val: number) => {
        if (val > 0) return 'text-green-600';
        if (val < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const getBgColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-600';
        if (grade.startsWith('B')) return 'bg-green-500';
        if (grade.startsWith('C')) return 'bg-yellow-500';
        if (grade.startsWith('D')) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
            <h3 className="text-xl text-gray-500 mb-6">Revisions Grade</h3>

            <div className="flex items-center gap-4 mb-6">
                <span className="font-bold text-gray-900">{symbol} Revisions Grade</span>
                <span className={`px-2 py-0.5 text-white font-bold text-sm rounded ${getBgColor(data.grade)}`}>
                    {data.grade}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="text-gray-600 font-bold border-b border-gray-200">
                            <th className="text-left py-2"></th>
                            <th className="py-2">{symbol}</th>
                            <th className="py-2">Sector Median</th>
                            <th className="py-2">% Diff. to Sector</th>
                            <th className="py-2">{symbol} 5Y Avg.</th>
                            <th className="py-2">% Diff. to 5Y Avg.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <tr>
                            <td className="text-left py-3 font-bold text-gray-800">FY1 Up Revisions (last 90 days)</td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                                {data.up.count} ({data.up.percent}%)
                            </td>
                            <td className="py-3 px-4 text-gray-900">{data.sector.up}%</td>
                            <td className={`py-3 px-4 font-semibold ${getColor(data.diffSector.up)}`}>
                                {data.diffSector.up > 0 ? '+' : ''}{data.diffSector.up}%
                            </td>
                            <td className="py-3 px-4 text-gray-900">{data.fiveYearAvg.up}%</td>
                            <td className={`py-3 px-4 font-semibold ${getColor(data.diffFiveYear.up)}`}>
                                {data.diffFiveYear.up > 0 ? '+' : ''}{data.diffFiveYear.up}%
                            </td>
                        </tr>
                        <tr>
                            <td className="text-left py-3 font-bold text-gray-800">FY1 Down Revisions (last 90 days)</td>
                            <td className="py-3 px-4 text-gray-900 font-medium">
                                {data.down.count} ({data.down.percent}%)
                            </td>
                            <td className="py-3 px-4 text-gray-900">{data.sector.down}%</td>
                            <td className={`py-3 px-4 font-semibold ${getColor(data.diffSector.down)}`}>
                                {data.diffSector.down > 0 ? '+' : ''}{data.diffSector.down}%
                            </td>
                            <td className="py-3 px-4 text-gray-900">{data.fiveYearAvg.down}%</td>
                            <td className={`py-3 px-4 font-semibold ${getColor(data.diffFiveYear.down)}`}>
                                {data.diffFiveYear.down > 0 ? '+' : ''}{data.diffFiveYear.down}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>*Grades are relative to the <span className="text-blue-500 hover:underline cursor-pointer">Information Technology</span> sector</p>
                <p>**NM signifies a non meaningful value. A dash signifies the data is not available.</p>
            </div>
        </div>
    );
}
