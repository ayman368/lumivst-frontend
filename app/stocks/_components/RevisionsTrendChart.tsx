'use client';

export function RevisionsTrendChart({ title, series }: any) {
    if (!series || series.length === 0) return null;

    // Fixed mock dimensions
    const width = 800;
    const height = 300;
    const padding = 40;

    // Helper to scale points
    // Assume x is 0-7 (fixed points) mapped to width
    // Assume y is 0-MaxVal mapped to height

    // Find absolute max value for scaling y-axis
    const allValues = series.flatMap((s: any) => s.data);
    const maxVal = Math.max(...allValues) * 1.1;
    const minVal = 0;

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
                <h3 className="text-xl text-gray-500 mr-4">{title}</h3>
                {/* Legend Chips */}
                {series.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 border px-2 py-1 rounded bg-white shadow-sm text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                        <span className="font-bold text-gray-700">{s.label}</span>
                        <span className="font-bold text-black">{s.value}</span>
                        <span className="text-gray-400 text-[10px]">Consensus</span>
                    </div>
                ))}
            </div>

            <div className="relative w-full h-[300px] border-b border-l border-gray-100">
                {/* Y Axis Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100" style={{ bottom: `${p * 100}%` }}>
                        <span className="absolute right-0 -top-2 text-[10px] text-gray-400 bg-white px-1">
                            {(maxVal * p).toFixed(2)}
                        </span>
                    </div>
                ))}

                {/* SVG Chart */}
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 100`}>
                    {series.map((s: any, i: number) => {
                        // Build polyline points
                        // Data array length is assumed 8 for now based on mock
                        const points = s.data.map((val: number, j: number) => {
                            const x = (j / (s.data.length - 1)) * 100;
                            const y = 100 - (val / maxVal) * 100;
                            return `${x},${y}`;
                        });

                        // Create step line effect using L command logic if needed, but polyline is simpler for "trend"
                        // Image shows step-like, but smooth enough. Let's stick to standard polyline for simplicity first iteration.
                        // Actually image shows steps. Let's try to simulate steps if possible? 
                        // For now, straight lines between points is safer.

                        return (
                            <polyline
                                key={i}
                                points={points.join(' ')}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>

                {/* X Axis Labels (Mock) */}
                <div className="absolute -bottom-6 w-full flex justify-between text-[10px] text-gray-400 px-2">
                    <span>Sep 2020</span>
                    <span>Jun 2021</span>
                    <span>Apr 2022</span>
                    <span>Jan 2023</span>
                    <span>Nov 2023</span>
                    <span>Aug 2024</span>
                    <span>Jun 2025</span>
                </div>
            </div>
        </div>
    );
}
