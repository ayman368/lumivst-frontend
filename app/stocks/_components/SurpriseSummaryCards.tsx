export function SurpriseSummaryCards({ summary, period = 'annual' }: any) {
    if (!summary) return null;

    const subtitle = period === 'annual' ? 'Last 2 Years' : 'Last 2 Years'; // Assuming same for both based on image

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl text-gray-500 mb-2">Earnings Surprise Summary</h3>
            <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                <div>
                    <p className="text-sm font-bold text-gray-900 border-l-2 border-gray-300 pl-3">EPS # of Beats</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.eps.beats}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 border-l-2 border-gray-300 pl-3">EPS # of Misses</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.eps.misses}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 border-l-2 border-gray-300 pl-3">EPS # of in-lines</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.eps.inline}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 border-l-2 border-gray-300 pl-3">Revenue # of Beats</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.revenue.beats}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 border-l-2 border-gray-300 pl-3">Revenue # of Misses</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.revenue.misses}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 border-l-2 border-gray-300 pl-3">Revenue # of in-lines</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.revenue.inline}</p>
                </div>
            </div>
        </div>
    );
}
