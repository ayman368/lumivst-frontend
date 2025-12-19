export function EarningsSummary({ lastQuarter, upcomingQuarter }: any) {
    if (!lastQuarter || !upcomingQuarter) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latest Quarter Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl text-gray-500 mb-6">Latest Quarter's Earnings</h3>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">Announce Date</span>
                        <span className="font-medium">{lastQuarter.date}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">EPS Normalized Actual</span>
                        <div className="text-right">
                            <span className="font-bold">{lastQuarter.epsNormalized}</span>
                            <span className="text-green-600 ml-2 text-xs font-semibold">(Beat by {lastQuarter.epsBeat})</span>
                        </div>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">EPS GAAP Actual</span>
                        <div className="text-right">
                            <span className="font-bold">{lastQuarter.epsGaap}</span>
                            <span className="text-green-600 ml-2 text-xs font-semibold">(Beat by {lastQuarter.epsGaapBeat})</span>
                        </div>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">Revenue Actual</span>
                        <span className="font-bold">{lastQuarter.revenue}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">Revenue Surprise</span>
                        <span className="text-green-600 font-bold text-xs">Beat by {lastQuarter.revenueBeat}</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Quarter Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl text-gray-500 mb-6">Upcoming Quarter's Earnings</h3>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">Announce Date</span>
                        <span className="font-medium">{upcomingQuarter.date}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">EPS Normalized Estimate</span>
                        <span className="font-bold">{upcomingQuarter.epsEstimate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">EPS GAAP Estimate</span>
                        <span className="font-bold">{upcomingQuarter.epsGaapEstimate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">Revenue Estimate</span>
                        <span className="font-bold">{upcomingQuarter.revenueEstimate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-gray-700">EPS Revisions (Last 90 Days)*</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-green-600 font-bold">
                                <span className="text-[10px]">▲</span> {upcomingQuarter.revisions.up}
                            </div>
                            <div className="flex items-center gap-1 text-red-500 font-bold">
                                <span className="text-[10px]">▼</span> {upcomingQuarter.revisions.down}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
