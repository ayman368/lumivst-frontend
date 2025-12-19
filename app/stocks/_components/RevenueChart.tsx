'use client';

interface RevenueChartProps {
    data?: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data) return null;

    // Find max value for scaling
    const maxVal = Math.max(...data.map(d => Math.max(d.value, d.estimate || 0))) * 1.1;

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-medium text-gray-700 mb-6">Revenue</h3>

            <div className="flex items-center gap-4 mb-8">
                <span className="text-sm text-gray-500">Period:</span>
                <select className="bg-gray-100 border-none rounded px-3 py-1 text-sm font-medium text-gray-700 cursor-pointer focus:ring-0">
                    <option>Annual</option>
                    <option>Quarterly</option>
                </select>

                <div className="flex gap-4 ml-auto text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
                        <span>Revenue Estimate</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            {/* Chart */}
            <div className="relative h-[250px] border-b border-gray-200 mr-16">
                {/* Y-Axis Lines (Right Side) */}
                {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
                    const val = Math.round(maxVal * ratio);
                    return (
                        <div key={ratio} className="absolute w-full border-t border-gray-100 flex items-center justify-end" style={{ bottom: `${ratio * 100}%` }}>
                            <span className="absolute right-0 translate-x-full pl-2 text-xs text-gray-400">{val}B</span>
                        </div>
                    );
                })}

                {/* Bars */}
                <div className="absolute inset-0 flex justify-between items-end px-4">
                    {data.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group relative">
                            <div
                                className={`w-8 rounded-t-sm transition-all hover:opacity-80 ${item.estimate ? 'bg-emerald-400' : 'bg-emerald-500'}`}
                                style={{
                                    height: `${((item.estimate || item.value) / maxVal) * 100}%`
                                }}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {(item.estimate || item.value).toFixed(2)}B
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{item.year.split(' ')[1]}</span>
                            <span className="text-[10px] text-gray-300 absolute -bottom-4">{item.year.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">More On Revenue »</a>
            </div>
        </div>
    )
}
