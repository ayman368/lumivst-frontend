'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { EstimatesSection } from './EstimatesSection';
import { AnnualEstimatesSummary } from './AnnualEstimatesSummary';
import { QuarterlyEstimatesSummary } from './QuarterlyEstimatesSummary';

export function EstimatesPageContent({ data }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const period = searchParams.get('period') === 'quarterly' ? 'quarterly' : 'annual';

    const handlePeriodChange = (newPeriod: string) => {
        router.push(`?period=${newPeriod}`, { scroll: false });
    };

    return (
        <div className="space-y-8">
            {/* Page Header with Toggle - Top Right */}
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${period === 'annual' ? 'border-none' : ''}`}>
                            {period === 'annual' && <div className="w-4 h-4 rounded-full bg-black" />}
                        </div>
                        <input
                            type="radio"
                            name="estimates-period"
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
                            name="estimates-period"
                            value="quarterly"
                            checked={period === 'quarterly'}
                            onChange={() => handlePeriodChange('quarterly')}
                            className="hidden"
                        />
                        <span className={`font-medium ${period === 'quarterly' ? 'text-black font-bold' : 'text-gray-500'}`}>Quarterly</span>
                    </label>
                </div>
            </div>

            {/* 1. Summary Block */}
            {period === 'annual' ? <AnnualEstimatesSummary /> : <QuarterlyEstimatesSummary />}

            {/* 2. Consensus EPS Estimates */}
            <EstimatesSection
                title="Consensus EPS Estimates"
                rows={period === 'annual' ? data.estimates.eps : data.estimates.epsQuarterly}
                type="eps"
                period={period}
            />

            {/* 3. Consensus Revenue Estimates */}
            <EstimatesSection
                title="Consensus Revenue Estimates"
                rows={period === 'annual' ? data.estimates.revenue : data.estimates.revenueQuarterly}
                type="revenue"
                valuePrefix="$"
                period={period}
            />
        </div>
    );
}
