'use client';
import { useState } from 'react';

export function EarningsChart({ data }: any) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Scaling helpers
    const maxVal = 2.40; // Fixed max based on image roughly
    const minVal = 0.00;
    const chartHeight = 300;
    const barWidth = 16;
    const gap = 12;

    // Line scaling (Change YoY) - Map -25% to 125% to right axis
    // 0% line needs to align nicely? Let's just create a separate scale.
    // Image shows 0% near bottom, 125% near top.

    // Normalize bar height
    const getBarHeight = (val: number) => {
        if (!val) return 0;
        return (val / maxVal) * chartHeight;
    };

    // Normalize line point
    // Let's fake line data points to match image curve since I don't have exact YoY data in mock for the chart line
    // Just visually mocking the line path concept
    const linePoints = [
        60, 20, 50, 65, 90, 120, 80, 50
    ]; // y percentages

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-gray-500">EPS Surprise & Estimates by Quarter</h3>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>EPS change YoY</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-700"></div>Consensus</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div>Actual</div>
                </div>
            </div>

            <div className="relative h-[350px] w-full">
                {/* Y-Axis Left (Values) */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400">
                    <span>2.40</span>
                    <span>1.80</span>
                    <span>1.20</span>
                    <span>0.60</span>
                    <span>0.00</span>
                </div>

                {/* Y-Axis Right (%) */}
                <div className="absolute right-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400 text-right">
                    <span>125.00%</span>
                    <span>100.00%</span>
                    <span>75.00%</span>
                    <span>50.00%</span>
                    <span>25.00%</span>
                </div>

                {/* Chart Content */}
                <svg className="absolute left-8 right-12 top-0 h-[calc(100%-32px)] w-[calc(100%-80px)]" preserveAspectRatio="none">
                    {/* Horizontal Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
                        <line key={i} x1="0" y1={`${y * 100}%`} x2="100%" y2={`${y * 100}%`} stroke="#f3f4f6" strokeWidth="1" />
                    ))}

                    {/* Bars */}
                    {data.map((item: any, i: number) => {
                        const x = (i / (data.length)) * 100 + 4; // Shift right a bit
                        const estHeight = getBarHeight(item.estimate);
                        const actHeight = getBarHeight(item.actual);

                        return (
                            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                                {/* Consensus Bar (Dark) */}
                                <rect
                                    x={`${x}%`}
                                    y={chartHeight - estHeight}
                                    width="4%"
                                    height={estHeight}
                                    fill="#374151" /* gray-700 */
                                    rx="1"
                                />

                                {/* Actual Bar (Blue) - Only if exists */}
                                {item.actual && (
                                    <rect
                                        x={`${x + 4.5}%`}
                                        y={chartHeight - actHeight}
                                        width="4%"
                                        height={actHeight}
                                        fill="#60a5fa" /* blue-400 */
                                        rx="1"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* YoY Line (Orange) */}
                    <polyline
                        points={data.map((_: any, i: number) => {
                            const x = (i / (data.length)) * 100 + 6;
                            const y = 300 - (linePoints[i] / 100) * 200; // Mock mapping
                            return `${x}%,${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                    />
                    {/* Line dots */}
                    {data.map((_: any, i: number) => {
                        const x = (i / (data.length)) * 100 + 6;
                        const y = 300 - (linePoints[i] / 100) * 200;
                        return (
                            <circle key={i} cx={`${x}%`} cy={y} r="3" fill="#f97316" stroke="white" strokeWidth="1" />
                        )
                    })}
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute bottom-0 left-8 right-12 flex justify-between text-xs text-gray-500">
                    {data.map((item: any, i: number) => (
                        <div key={i} className="flex flex-col items-center w-[12%] text-center">
                            <span className="font-semibold">{item.quarter.split(' ')[0]}</span>
                            <span className="text-[10px] text-gray-400">{item.quarter.split(' ')[1]}</span>
                            {/* Beat/Miss Labels */}
                            {item.type === 'actual' && (
                                <span className="text-[10px] text-green-600 font-bold mt-1">Beat by</span>
                            )}
                            {item.type === 'estimate' && (
                                <span className="text-[10px] text-green-600 font-bold mt-1">{/* Placeholder for future estimates */}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
