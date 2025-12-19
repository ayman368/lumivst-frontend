interface QuantRankingProps {
    data?: {
        sector: string;
        industry: string;
        overall: string;
        sectorRank: string;
        industryRank: string;
    }
}

export function QuantRanking({ data }: QuantRankingProps) {
    const ranking = data || {
        sector: "Information Technology",
        industry: "Semiconductors",
        overall: "747 out of 4327",
        sectorRank: "93 out of 539",
        industryRank: "16 out of 67"
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-lg">Quant Ranking</h3>
                <span className="text-gray-300 text-xs bg-gray-100 px-1.5 py-0.5 rounded cursor-help">?</span>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Sector</span>
                    <span className="text-blue-600 hover:underline cursor-pointer">{ranking.sector}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Industry</span>
                    <span className="text-blue-600 hover:underline cursor-pointer">{ranking.industry}</span>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Ranked Overall</span>
                    <span className="text-blue-600 font-semibold cursor-pointer">{ranking.overall}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Ranked in Sector</span>
                    <span className="text-blue-600 font-semibold cursor-pointer">{ranking.sectorRank}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Ranked in Industry</span>
                    <span className="text-blue-600 font-semibold cursor-pointer">{ranking.industryRank}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Quant Ratings Beat The Market »</a>
            </div>
        </div>
    );
}
