'use client';

import ChartingTabs from '../../_components/ChartingTabs';
import { MOCK_STOCK_DATA } from '../../data/mockData';

export default function SplitsPage() {
    const data = MOCK_STOCK_DATA.splits;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            <ChartingTabs activeTab="splits" />

            <div className="mt-8 bg-white p-6">
                <h1 className="text-[26px] text-[#333333] font-normal mb-8">NVDA Stock Split History</h1>

                <div className="w-full">
                    <table className="w-full border-t border-b border-[#cccccc]">
                        <thead>
                            <tr className="border-b border-[#333333]">
                                <th className="py-3 px-0 text-left text-[13px] font-bold text-[#333333] uppercase tracking-wide">Date</th>
                                <th className="py-3 px-0 text-right text-[13px] font-bold text-[#333333] uppercase tracking-wide">Ratio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eeeeee]">
                            {data?.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="py-3.5 px-0 text-[13px] font-bold text-[#333333]">{row.date}</td>
                                    <td className="py-3.5 px-0 text-right text-[13px] font-bold text-[#333333]">{row.ratio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
