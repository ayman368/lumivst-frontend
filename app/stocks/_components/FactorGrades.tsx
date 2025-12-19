interface GradeRowProps {
    label: string;
    grade: string;
    history: string[]; // 3M ago, 6M ago
}

function GradeRow({ label, grade, history }: GradeRowProps) {
    const getGradeColor = (g: string) => {
        if (g.startsWith('A')) return 'bg-green-700 text-white';
        if (g.startsWith('B')) return 'bg-green-600 text-white';
        if (g.startsWith('C')) return 'bg-yellow-500 text-black';
        if (g.startsWith('D')) return 'bg-orange-500 text-white';
        if (g.startsWith('F')) return 'bg-red-700 text-white';
        return 'bg-gray-200 text-gray-700';
    };

    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-sm font-medium text-blue-600 hover:underline">{label}</span>
            <div className="flex gap-4 items-center">
                <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${getGradeColor(grade)}`}>
                    {grade}
                </span>
                {history.map((h, i) => (
                    <span key={i} className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400 bg-gray-100 rounded">
                        {h}
                    </span>
                ))}
            </div>
        </div>
    );
}

interface FactorGradesProps {
    data?: {
        valuation: string;
        growth: string;
        profitability: string;
        momentum: string;
        revisions: string;
    }
}

export function FactorGrades({ data }: FactorGradesProps) {
    const grades = data || {
        valuation: "F",
        growth: "A",
        profitability: "A+",
        momentum: "B+",
        revisions: "B"
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-lg">Factor Grades</h3>
                <span className="text-gray-300 text-xs bg-gray-100 px-1.5 py-0.5 rounded cursor-help">?</span>
            </div>

            <div className="flex justify-end gap-5 mb-2 text-xs text-gray-400 font-medium px-1">
                <span>Now</span>
                <span>3M ago</span>
                <span>6M ago</span>
            </div>

            <div className="space-y-1">
                <GradeRow label="Valuation" grade={grades.valuation} history={[grades.valuation, grades.valuation]} />
                <GradeRow label="Growth" grade={grades.growth} history={[grades.growth, grades.growth]} />
                <GradeRow label="Profitability" grade={grades.profitability} history={[grades.profitability, grades.profitability]} />
                <GradeRow label="Momentum" grade={grades.momentum} history={[grades.momentum, grades.momentum]} />
                <GradeRow label="Revisions" grade={grades.revisions} history={[grades.revisions, 'C']} />
            </div>
        </div>
    );
}
