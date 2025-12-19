export function QuarterlyEstimatesSummary() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl text-gray-500 mb-4">Quarterly Estimates Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <p className="text-sm font-bold text-gray-500">FQ4 Announce Date</p>
                    <p className="font-bold text-gray-900 mt-1">02/26/2026 (Post-Market)</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-orange-500 pl-3">Consensus EPS Estimates</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">1.52</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-gray-900 pl-3">Consensus Revenue Estimates</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">65.48B</p>
                </div>
            </div>
        </div>
    );
}
