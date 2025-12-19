export function EstimatesTable({ title, headers, rows, container = true }: any) {
    if (!rows || rows.length === 0) return null;

    const TableContent = () => (
        <>
            {container && title && <h3 className="text-xl text-gray-500 mb-6">{title}</h3>}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-gray-600 font-bold border-b border-gray-200">
                            <th className="py-2 pr-4">Fiscal Period Ending</th>
                            {headers.map((h: string, i: number) => (
                                <th key={i} className={`py-2 px-4 ${h === '# of Analysts' ? 'text-right' : ''}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 pr-4 font-bold text-gray-900">{row.end}</td>
                                {headers.map((h: string, j: number) => {
                                    // Map header to object key loosely
                                    let content = '-';
                                    if (h.includes('Estimate')) content = row.estimate;
                                    else if (h.includes('Growth')) content = row.epsYoy || row.salesYoy || '-'; // Handle YoY if present
                                    else if (h.includes('Forward')) content = row.forwardPe || row.forwardPs;
                                    else if (h === 'Low') content = row.low;
                                    else if (h === 'High') content = row.high;
                                    else if (h === '# of Analysts') content = row.analysts;

                                    return (
                                        <td key={j} className={`py-3 px-4 ${h === '# of Analysts' ? 'text-right' : ''}`}>
                                            {content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    if (container) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
                <TableContent />
            </div>
        );
    }

    return <div className="mt-4"><TableContent /></div>;
}
