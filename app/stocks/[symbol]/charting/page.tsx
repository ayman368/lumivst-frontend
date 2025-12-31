'use client';

import ChartingTabs from '../../_components/ChartingTabs';
import MainStockChart from '../../_components/MainStockChart';

export default function ChartingPage() {
    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            <ChartingTabs activeTab="charting" />
            <div className="mt-6">
                <MainStockChart />
            </div>
        </div>
    );
}
