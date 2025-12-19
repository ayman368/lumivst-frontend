export function AnnualEstimatesSummary() {
    // Hardcoded mock values based on Image 4
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl text-gray-500 mb-4">Annual Estimates Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <p className="text-sm font-bold text-gray-500">Fiscal Period Ending</p>
                    <p className="font-bold text-gray-900 mt-1">Jan 2028</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-orange-500 pl-3">Consensus EPS Estimates</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">4.69</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-gray-900 pl-3">Consensus Revenue Estimates</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">213.13B</p>
                </div>
            </div>
        </div>
    );
}
