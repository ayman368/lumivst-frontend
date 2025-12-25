'use client';

const PE_RATIO_DATA = [
    { label: "2025 Actual", value: "60.53", isActual: true },
    { label: "2026 Estimated, using the consensus earnings estimate", value: "38.59", isEstimate: true },
    { label: "2027 Estimated, using the consensus earnings estimate", value: "24.16", isEstimate: true },
    { label: "2028 Estimated, using the consensus earnings estimate", value: "18.70", isEstimate: true },
    { label: "2029 Estimated, using the consensus earnings estimate", value: "16.95", isEstimate: true },
];

const EPS_GROWTH_DATA = [
    { label: "Jan 2026", value: "56.85%" },
    { label: "Jan 2027", value: "59.75%" },
    { label: "Jan 2028", value: "29.17%" },
    { label: "Jan 2029", value: "10.36%" },
];

export default function PERatioPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* P/E Ratio Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-4">NVDA Price/Earnings (P/E) Ratio</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        View NVIDIA Corporation (NVDA) current and estimated P/E ratio data provided by Seeking Alpha.
                    </p>

                    <h3 className="text-xl font-bold text-gray-800 mb-4">Price/Earnings Ratio</h3>

                    <div className="divide-y divide-gray-100">
                        {PE_RATIO_DATA.map((item, i) => (
                            <div key={i} className="flex justify-between py-3 hover:bg-gray-50 transition-colors">
                                <span className={`text-sm ${item.isActual ? 'font-bold text-blue-600' : 'font-medium text-gray-800'}`}>
                                    {item.label}
                                </span>
                                <span className="font-bold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Consensus EPS Estimate Growth Rate */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Consensus EPS Estimate Growth Rate</h3>

                    <div className="divide-y divide-gray-100">
                        {EPS_GROWTH_DATA.map((item, i) => (
                            <div key={i} className="flex justify-between py-3 hover:bg-gray-50 transition-colors">
                                <span className="font-bold text-blue-600 text-sm">{item.label}</span>
                                <span className="font-bold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
