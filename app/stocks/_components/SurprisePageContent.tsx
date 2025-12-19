'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SurpriseSummaryCards } from './SurpriseSummaryCards';
import { SurpriseChart } from './SurpriseChart';
import { SurpriseTable } from './SurpriseTable';

export function SurprisePageContent({ data }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const period = searchParams.get('period') === 'quarterly' ? 'quarterly' : 'annual';

    const handlePeriodChange = (newPeriod: string) => {
        router.push(`?period=${newPeriod}`, { scroll: false });
    };

    const activeData = period === 'quarterly' ? data.surpriseData.quarterly : data.surpriseData.annual;

    if (!activeData) return <div className="text-center py-8 text-gray-500">No data available.</div>;

    return (
        <div className="space-y-8">
            {/* Header / Toggle */}
            <div className="flex justify-between items-center mb-4">
                <div></div> {/* Spacer */}
                <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${period === 'annual' ? 'border-none' : ''}`}>
                            {period === 'annual' && <div className="w-4 h-4 rounded-full bg-black" />}
                        </div>
                        <input
                            type="radio"
                            name="surprise-period"
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
                            name="surprise-period"
                            value="quarterly"
                            checked={period === 'quarterly'}
                            onChange={() => handlePeriodChange('quarterly')}
                            className="hidden"
                        />
                        <span className={`font-medium ${period === 'quarterly' ? 'text-black font-bold' : 'text-gray-500'}`}>Quarterly</span>
                    </label>
                </div>
            </div>

            <SurpriseSummaryCards summary={activeData.summary} period={period} />

            {/* EPS Section */}
            <div className="space-y-6">
                {/* 1. % Surprise Chart - Standalone Card */}
                <SurpriseChart title="Earnings Surprise (EPS) - % Surprise" data={activeData.epsData} type="percent" container={true} period={period} />

                {/* 2. Actual vs Consensus + Table - Grouped Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <SurpriseChart title="Earnings Surprise (EPS) - Actual vs Consensus" data={activeData.epsData} type="actual" container={false} period={period} />
                    <SurpriseTable rows={activeData.epsData} type="eps" container={false} />
                </div>
            </div>

            {/* Revenue Section */}
            <div className="space-y-6">
                {/* 1. % Surprise Chart - Standalone Card */}
                <SurpriseChart title="Revenue Surprise - % Surprise" data={activeData.revenueData} type="percent" container={true} period={period} />

                {/* 2. Actual vs Consensus + Table - Grouped Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <SurpriseChart title="Revenue Surprise - Actual vs Consensus" data={activeData.revenueData} type="actual" container={false} period={period} />
                    <SurpriseTable rows={activeData.revenueData} type="revenue" container={false} />
                </div>
            </div>

        </div>
    );
}
