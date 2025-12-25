'use client';

const CAPITAL_STRUCTURE_DATA = [
    { label: "Market Cap", value: "$4.40T" },
    { label: "Total Debt", value: "$10.92B" },
    { label: "Cash", value: "$60.61B" },
    { label: "Other", value: "-" },
    { label: "Enterprise Value", value: "$4.35T", isHighlight: true },
];

export default function CapitalStructurePage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Capital Structure */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Capital Structure</h2>

                    <div className="divide-y divide-gray-100">
                        {CAPITAL_STRUCTURE_DATA.map((item, i) => (
                            <div key={i} className="flex justify-between py-4 hover:bg-gray-50 transition-colors">
                                <span className={`font-bold text-sm ${item.isHighlight ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {item.label}
                                </span>
                                <span className="font-bold text-gray-900 text-lg">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
