export function RevisionsSummaryCards({ summary, period = 'annual' }: any) {
    if (!summary) return null;

    const title = period === 'annual' ? 'Annual Estimates Revisions' : 'Quarterly Estimates Revisions';
    const subtitle = period === 'annual'
        ? 'Upcoming Fiscal Year End - Revisions for Last 3 Months'
        : 'Upcoming Quarter - Revisions for Last 3 Months';

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl text-gray-500 mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-orange-500 pl-3">EPS # of Up Revisions</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.epsUp}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-orange-500 pl-3">EPS # of Down Revisions</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.epsDown}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-blue-500 pl-3">Revenue # of Up Revisions</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.revUp}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 border-l-2 border-blue-500 pl-3">Revenue # of Down Revisions</p>
                    <p className="font-bold text-gray-900 mt-1 pl-3">{summary.revDown}</p>
                </div>
            </div>
        </div>
    );
}
