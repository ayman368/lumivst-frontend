'use client';
import { ConsensusChart } from './ConsensusChart';
import { EstimatesTable } from './EstimatesTable';

export function EstimatesSection({ title, rows, type, valuePrefix, period }: any) {

    // Transform headers based on type and period
    // Quarterly view does not have Forward PE/PS in the headers per instructions/image
    let headers = [];
    if (type === 'eps') {
        headers = ['EPS Estimate', 'YoY Growth', period === 'annual' ? 'Forward PE' : null, 'Low', 'High', '# of Analysts'].filter(Boolean);
    } else {
        headers = ['Revenue Estimate', 'YoY Growth', period === 'annual' ? 'Forward P/S' : null, 'Low', 'High', '# of Analysts'].filter(Boolean);
    }

    // Mock chart data generation (since we don't have separate chart data in mock for all views yet)
    const chartData = rows.map((r: any) => ({
        year: r.end.split(' ')[0], // Month or Year label
        value: parseFloat(r.estimate.replace(/[,$B]/g, ''))
    }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl text-gray-500 mb-6">{title}</h3>

            <ConsensusChart
                data={chartData}
                valuePrefix={valuePrefix}
                container={false}
            />
            <EstimatesTable
                headers={headers}
                rows={rows.map((r: any) => ({
                    ...r,
                    // Ensure YoY exists or fallback
                    epsYoy: r.epsYoy || '56.72%',
                    salesYoy: r.salesYoy || '63.32%'
                }))}
                container={false}
            />
        </div>
    );
}
