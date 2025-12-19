interface RatingRowProps {
    label: string;
    value: string;
    score: number;
    colorClass: string;
}

function RatingRow({ label, value, score, colorClass }: RatingRowProps) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${colorClass} w-[90px] text-center`}>
                    {value}
                </span>
                <span className="text-sm font-bold text-gray-700 w-[30px] text-right">{score}</span>
            </div>
        </div>
    );
}

// ... (RatingRow component remains the same)

interface RatingsSummaryProps {
    data?: {
        saAnalysts: { score: number; label: string };
        wallStreet: { score: number; label: string };
        quant: { score: number; label: string };
    }
}

export function RatingsSummary({ data }: RatingsSummaryProps) {
    // Default values if data is not provided (or for now)
    const ratings = data || {
        saAnalysts: { score: 3.74, label: "BUY" },
        wallStreet: { score: 4.67, label: "STRONG BUY" },
        quant: { score: 3.49, label: "HOLD" }
    };

    const getLabelColor = (label: string) => {
        if (label.includes("STRONG")) return 'bg-green-700';
        if (label === "BUY") return 'bg-green-600';
        if (label === "HOLD") return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-lg">Ratings Summary</h3>
                <span className="text-gray-300 text-xs bg-gray-100 px-1.5 py-0.5 rounded cursor-help">?</span>
            </div>

            <div className="space-y-1">
                <RatingRow label="SA Analysts" value={ratings.saAnalysts.label} score={ratings.saAnalysts.score} colorClass={getLabelColor(ratings.saAnalysts.label)} />
                <RatingRow label="Wall Street" value={ratings.wallStreet.label} score={ratings.wallStreet.score} colorClass={getLabelColor(ratings.wallStreet.label)} />
                <RatingRow label="Quant" value={ratings.quant.label} score={ratings.quant.score} colorClass={getLabelColor(ratings.quant.label)} />
            </div>
        </div>
    );
}
