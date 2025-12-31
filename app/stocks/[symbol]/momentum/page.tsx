'use client';
import { useParams } from 'next/navigation';
import { MomentumGradeTable } from '../../_components/MomentumGradeTable';
import { PricePerformanceTable } from '../../_components/PricePerformanceTable';
import { MomentumChart } from '../../_components/MomentumChart';
import { MOCK_STOCK_DATA } from '../../data/mockData';

// Helper for the table inside Moving Averages chart
function MovingAveragesTable({ data }: { data: any }) {
    return (
        <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="py-2 text-transparent">Label</th>
                        {data.headers.map((h: string) => (
                            <th key={h} className="py-2 px-4 font-bold text-gray-400 text-xs uppercase text-right tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                            <td className="py-2.5 font-bold text-gray-900">{row.label}</td>
                            {row.values.map((v: string, j: number) => (
                                <td key={j} className={`py-2.5 px-4 text-right font-bold ${row.isGreen ? 'text-green-600' : 'text-gray-900'}`}>
                                    {v}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function MomentumPage() {
    const params = useParams();
    const symbol = (params.symbol as string).toUpperCase();
    const data = MOCK_STOCK_DATA.momentum;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9 space-y-8">

                    {/* Momentum Grade Table */}
                    <MomentumGradeTable data={data} symbol={symbol} />

                    {/* Price Performance Table */}
                    <PricePerformanceTable data={data.pricePerformance} />

                    {/* Chart: Relative Strength */}
                    <MomentumChart
                        title={data.charts.relativeStrength.title}
                        summary={data.charts.relativeStrength.summary}
                    />

                    {/* Chart 1: Price Return vs S&P 500 */}
                    <MomentumChart
                        title={data.charts.priceReturnVsSp500.title}
                        summary={data.charts.priceReturnVsSp500.summary}
                    />

                    {/* Chart 2: Total Return vs S&P 500 Total Return */}
                    <MomentumChart
                        title={data.charts.totalReturnVsSp500.title}
                        summary={data.charts.totalReturnVsSp500.summary}
                    />

                    {/* Chart 3: Price Return vs Total Return */}
                    <MomentumChart
                        title={data.charts.priceReturnVsTotalReturn.title}
                        summary={data.charts.priceReturnVsTotalReturn.summary}
                    />


                    {/* Chart 4: Moving Averages */}
                    <MomentumChart
                        title={data.charts.movingAverages.title}
                        summary={data.charts.movingAverages.summary}
                        isMovingAverage={true}
                    >
                        <MovingAveragesTable data={data.charts.movingAverages.table} />
                    </MomentumChart>

                </div>

                <div className="lg:col-span-3 space-y-5">
                    {/* Sidebar Content Removed as requested */}
                </div>
            </div>
        </div>
    );
}
