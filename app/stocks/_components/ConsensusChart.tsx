'use client';

export function ConsensusChart({ title, data, valuePrefix = '', container = true }: any) {
    if (!data) return null;

    const maxVal = Math.max(...data.map((d: any) => d.value)) * 1.1;
    const minVal = 0;
    const height = 250;

    const getX = (i: number) => (i / (data.length - 1)) * 100;
    const getY = (val: number) => height - (val / maxVal) * height;

    const points = data.map((d: any, i: number) => `${getX(i)}%,${getY(d.value)}`).join(' ');

    const ChartContent = () => (
        <>
            {title && <h3 className="text-xl text-gray-500 mb-6">{title}</h3>}

            <div className="relative h-[250px] w-full px-8">
                {/* Horizontal grids */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100" style={{ bottom: `${p * 100}%` }}></div>
                ))}

                {/* Y Axis Labels (Right) */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 text-right h-full">
                    <span>{valuePrefix}{(maxVal).toFixed(2)}</span>
                    {/* ... intermediates */}
                    <span>{valuePrefix}{(minVal).toFixed(2)}</span>
                </div>

                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#374151" /* gray-700 */
                        strokeWidth="2"
                    />
                    {/* Grey area under curve? Image shows simple line. */}
                </svg>

                {/* X Axis Labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                    {data.map((d: any, i: number) => (
                        // Show label every few years to avoid crowding
                        (i % 2 === 0 || i === data.length - 1) ?
                            <span key={i} style={{ left: `${getX(i)}%`, position: 'absolute', transform: 'translateX(-50%)' }}>{d.year}</span> : null
                    ))}
                </div>
            </div>

            <br />
        </>
    );

    if (container) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
                <ChartContent />
            </div>
        );
    }

    return <div className="mt-6"><ChartContent /></div>;
}
