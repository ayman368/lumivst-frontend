'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { RevisionsSummaryCards } from './RevisionsSummaryCards';
import { RevisionsTrendChart } from './RevisionsTrendChart';
import { RevisionsTrendTable } from './RevisionsTrendTable';

export function RevisionsPageContent({ data }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const period = searchParams.get('period') === 'quarterly' ? 'quarterly' : 'annual';

    const handlePeriodChange = (newPeriod: string) => {
        router.push(`?period=${newPeriod}`, { scroll: false });
    };

    const activeData = period === 'quarterly' ? data.revisionsDataQuarterly : data.revisionsData;

    if (!activeData) return <div className="text-center py-8 text-gray-500">No data available for {period} view.</div>;

    return (
        <div className="space-y-8">
            {/* Header / Toggle */}
            <div className="flex justify-end items-center mb-4">
                {/* Right side Toggle */}
                <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${period === 'annual' ? 'border-none' : ''}`}>
                            {period === 'annual' && <div className="w-4 h-4 rounded-full bg-black" />}
                        </div>
                        <input
                            type="radio"
                            name="revisions-period"
                            value="annual"
                            checked={period === 'annual'}
                            onChange={() => handlePeriodChange('annual')}
                            className="hidden"
                        />
                        <span className={`font-medium ${period === 'annual' ? 'text-black font-bold' : 'text-gray-500'}`}>Annual</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${period === 'quarterly' ? 'border-none' : ''}`}>
                            {period === 'quarterly' && <div className="w-4 h-4 rounded-full bg-black" />}
                        </div>
                        <input
                            type="radio"
                            name="revisions-period"
                            value="quarterly"
                            checked={period === 'quarterly'}
                            onChange={() => handlePeriodChange('quarterly')}
                            className="hidden"
                        />
                        <span className={`font-medium ${period === 'quarterly' ? 'text-black font-bold' : 'text-gray-500'}`}>Quarterly</span>
                    </label>
                </div>
            </div>

            {/* Summary Cards */}
            <RevisionsSummaryCards summary={activeData?.summary} period={period} />

            {/* EPS Trend Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <RevisionsTrendChart
                    title="Consensus EPS Revision Trend"
                    series={activeData?.chartData.eps}
                />
                <RevisionsTrendTable rows={activeData?.epsTrends} />
            </div>

            {/* Revenue Trend Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <RevisionsTrendChart
                    title="Consensus Revenue Revision Trend"
                    series={activeData?.chartData.revenue}
                />
                <RevisionsTrendTable rows={activeData?.revenueTrends} valuePrefix="$" />
            </div>
        </div>
    );
}
