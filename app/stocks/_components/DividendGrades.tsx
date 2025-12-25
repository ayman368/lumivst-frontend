import Link from "next/link";

interface DividendGradesProps {
    data?: {  // الـ ? معناها: مش شرط يجي بيانات
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
        {
            label: 'Dividend Safety',
            grade: grades.safety,
            description: "The company's ability to continue paying current dividend amount.",
            href: "/dividends/safety"
        },
        {
            label: 'Dividend Growth',
            grade: grades.growth,
            description: "The attractiveness of the dividend growth rate when compared to peers.",
            href: "/dividends/growth"
        },
        {
            label: 'Dividend Yield',
            grade: grades.yield,
            description: "The attractiveness of the dividend yield compared to peers.",
            href: "/dividends/yield"
        },
        {
            label: 'Dividend Consistency',
            grade: grades.consistency,
            description: "The company's track record for paying consistent dividends.",
            href: "/dividends/history"
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-6">
                <h3 className="text-2xl font-normal text-gray-500">Dividend Grades</h3>
                <span className="flex items-center justify-center w-5 h-5 bg-gray-500 text-white text-xs font-bold rounded shadow-sm cursor-help">?</span>
            </div>

            <div className="w-full">
                {/* Header */}
                <div className="flex border-b border-gray-300 pb-2 mb-2 font-bold text-gray-700 text-xs">
                    <div className="w-1/4 pl-4 text-center">Category</div>
                    <div className="w-1/4 text-center">Sector Relative Grade</div>
                    <div className="w-1/2 text-center">Description</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                    {rows.map((row, idx) => (
                        <div key={idx} className="flex items-center py-3 hover:bg-gray-50 transition-colors">
                            <div className="w-1/4 pl-4">
                                <Link href={row.href} className="text-sm font-bold text-blue-600 hover:underline">
                                    {row.label}
                                </Link>
                            </div>
                            <div className="w-1/4 flex justify-center">
                                <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${getGradeColor(row.grade)}`}>
                                    {row.grade}
                                </span>
                            </div>
                            <div className="w-1/2 text-sm text-gray-900 font-medium">
                                {row.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
