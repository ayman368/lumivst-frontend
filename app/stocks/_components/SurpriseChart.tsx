'use client';

export function SurpriseChart({ title, data, type = 'percent', container = true, period = 'annual' }: { title: string, data: any[], type?: 'percent' | 'actual', container?: boolean, period?: string }) {
    if (!data || data.length === 0) return null;

    // ... (rest of the logic same)

    let maxVal = 0;
    if (type === 'percent') {
        maxVal = Math.max(...data.map(d => Math.abs(d.surprisePercent))) * 1.2;
    } else {
        const allVals = data.flatMap(d => [d.estimate, d.actual]);
        maxVal = Math.max(...allVals) * 1.2;
    }

    const containerClasses = container
        ? "bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6"
        : "mb-8";

    return (
        <div className={containerClasses}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-gray-500">{title}</h3>

                <div className="flex items-center gap-2">
                    {period === 'quarterly' && ['4 QTRs', '8 QTRs', '12 QTRs', 'MAX'].map((r, i) => (
                        <button key={r} className={`px-3 py-1 text-xs border rounded ${i === 2 ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-500 border-gray-300'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend for Dual Chart */}
            {
                type === 'actual' && (
                    <div className="flex justify-end gap-4 text-xs mb-2">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-700"></span> Consensus</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Actual</div>
                    </div>
                )
            }

            <div className="relative h-[300px] w-full border-b border-gray-200 ml-4">
                {/* Y Axis Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100" style={{ bottom: `${p * 100}%` }}>
                        <span className="absolute right-0 -top-2 text-[10px] text-gray-400 bg-white px-1">
                            {(maxVal * p).toFixed(2)}
                        </span>
                    </div>
                ))}

                {/* Bars Container */}
                <div className="absolute inset-0 flex items-end justify-between px-8">
                    {data.map((d, i) => {
                        if (type === 'percent') {
                            const h = (Math.abs(d.surprisePercent) / maxVal) * 100;
                            const isNegative = d.surprisePercent < 0;
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 w-full">
                                    <div
                                        className={`w-6 rounded-t-sm ${!isNegative ? 'bg-green-600' : 'bg-red-600'}`}
                                        style={{ height: `${Math.min(h, 100)}%` }} // clamp to 100
                                    ></div>
                                    <span className="text-[10px] text-gray-500 mt-2">{d.date.split(' ')[0]} {d.date.split(' ')[1].slice(2, 4)}</span>
                                </div>
                            );
                        } else {
                            const hEst = (d.estimate / maxVal) * 100;
                            const hAct = (d.actual / maxVal) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center w-full">
                                    <div className="flex gap-1 items-end h-full">
                                        <div className="w-3 bg-gray-700 rounded-t-sm" style={{ height: `${Math.min(hEst, 100)}%` }}></div>
                                        <div className="w-3 bg-blue-400 rounded-t-sm" style={{ height: `${Math.min(hAct, 100)}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-2">{d.date.split(' ')[0]} {d.date.split(' ')[1].slice(2, 4)}</span>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>

        </div >
    );
}
