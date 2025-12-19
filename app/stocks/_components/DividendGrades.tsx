interface DividendGradesProps {
    data?: {
        safety: string;
        growth: string;
        yield: string;
        consistency: string;
    }
}

export function DividendGrades({ data }: DividendGradesProps) {
    const getGradeColor = (g: string) => {
        if (g.startsWith('A')) return 'bg-green-700 text-white';
        if (g.startsWith('B')) return 'bg-green-600 text-white';
        if (g.startsWith('C')) return 'bg-yellow-500 text-black';
        if (g.startsWith('D')) return 'bg-orange-500 text-white';
        if (g.startsWith('F')) return 'bg-red-800 text-white';
        return 'bg-gray-200 text-gray-700';
    };

    const grades = data || {
        safety: "A+",
        growth: "A+",
        yield: "F",
        consistency: "C-"
    };

    const rows = [
        { label: 'Safety', grades: [grades.safety, grades.safety, grades.safety] },
        { label: 'Growth', grades: [grades.growth, grades.growth, grades.growth] },
        { label: 'Yield', grades: [grades.yield, grades.yield, grades.yield] },
        { label: 'Consistency', grades: [grades.consistency, grades.consistency, grades.consistency] }
    ];

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-lg">Dividend Grades</h3>
                <span className="text-gray-300 text-xs bg-gray-100 px-1.5 py-0.5 rounded cursor-help">?</span>
            </div>

            <div className="flex justify-end gap-5 mb-2 text-xs text-gray-400 font-medium px-1">
                <span>Now</span>
                <span>3M ago</span>
                <span>6M ago</span>
            </div>

            <div className="space-y-1">
                {rows.map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-sm font-medium text-blue-600 hover:underline">{row.label}</span>
                        <div className="flex gap-4 items-center">
                            {row.grades.map((g, i) => (
                                <span key={i} className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${i === 0 ? getGradeColor(g) : 'bg-gray-100 text-gray-400 font-medium'}`}>
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Dividend Grades Beat The Market »</a>
            </div>
        </div>
    );
}
