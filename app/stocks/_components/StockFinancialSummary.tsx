'use client';

import Link from 'next/link';

interface StockFinancialSummaryProps {
    data: any;
}

const SummaryCard = ({ title, grade, gradeColor, children, linkText, linkHref, className = "" }: any) => (
    <div className={`bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-normal text-gray-500">{title}</h3>
            {grade && (
                <span className={`${gradeColor || 'bg-green-700'} text-white text-sm font-bold px-2 py-1 rounded`}>
                    {grade}
                </span>
            )}
        </div>
        <div className="flex-grow">
            {children}
        </div>
        {linkText && (
            <div className="mt-4 pt-2">
                <Link href={linkHref || "#"} className="text-blue-600 hover:underline text-sm font-bold">
                    {linkText} »
                </Link>
            </div>
        )}
    </div>
);

const DataRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
        <span className="font-bold text-gray-800">{label}</span>
        <span className="text-gray-900">{value}</span>
    </div>
);

export function StockFinancialSummary({ data }: StockFinancialSummaryProps) {
    if (!data.earningsEstimates) return null; // Guard

    return (
        <div className="space-y-6 mt-8">

            {/* ROW 1: Earnings & Revisions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Earnings Estimates */}
                <SummaryCard title="Earnings Estimates" linkText="More On Earnings Estimates">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-200">
                                    <th className="font-bold pb-2 text-left">FY</th>
                                    <th className="font-bold pb-2">EPS</th>
                                    <th className="font-bold pb-2">YoY</th>
                                    <th className="font-bold pb-2">PE</th>
                                    <th className="font-bold pb-2">Sales</th>
                                    <th className="font-bold pb-2">YoY</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.earningsEstimates.map((row: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-2 text-left font-bold">{row.fy}</td>
                                        <td className="py-2">{row.eps}</td>
                                        <td className={`py-2 ${row.epsYoy.includes('+') ? 'text-green-600' : 'text-red-600'}`}>{row.epsYoy}</td>
                                        <td className="py-2 text-gray-600">{row.pe}</td>
                                        <td className="py-2">{row.sales}</td>
                                        <td className={`py-2 ${row.salesYoy.includes('+') ? 'text-green-600' : 'text-red-600'}`}>{row.salesYoy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SummaryCard>

                {/* Earnings Revisions */}
                <SummaryCard title="Earnings Revisions" grade={data.earningsRevisions.grade} gradeColor="bg-green-700" linkText="More On Earnings Revisions">
                    <div className="space-y-4">
                        <DataRow label="FY1 Up Revisions" value={data.earningsRevisions.upRevisions} />
                        <DataRow label="FY1 Down Revisions" value={data.earningsRevisions.downRevisions} />

                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-red-500">{data.earningsRevisions.percentDown}% Down</span>
                                <span className="text-green-600">{data.earningsRevisions.percentUp}% Up</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                                <div className="bg-red-500 h-full" style={{ width: `${data.earningsRevisions.percentDown}%` }}></div>
                                <div className="bg-green-600 h-full" style={{ width: `${data.earningsRevisions.percentUp}%` }}></div>
                            </div>
                        </div>
                    </div>
                </SummaryCard>
            </div>

            {/* ROW 2: Valuation & Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Valuation */}
                <SummaryCard title="Valuation" grade={data.factorGrades.valuation} gradeColor="bg-red-800" linkText="More On Valuation">
                    <div className="space-y-1">
                        {data.valuationMetrics.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>

                {/* Growth */}
                <SummaryCard title="Growth" grade={data.factorGrades.growth} gradeColor="bg-green-800" linkText="More On Growth">
                    <div className="space-y-1">
                        {data.growthMetrics.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>
            </div>

            {/* ROW 3: Profitability & Momentum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profitability */}
                <SummaryCard title="Profitability" grade={data.factorGrades.profitability} gradeColor="bg-green-800" linkText="More On Profitability">
                    <div className="space-y-1">
                        {data.profitabilityMetrics.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>

                {/* Momentum */}
                <SummaryCard title="Momentum" grade={data.factorGrades.momentum} gradeColor="bg-green-700" linkText="More On Momentum">
                    <div className="space-y-6">
                        <table className="w-full text-sm text-right">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-200">
                                    <th className="font-bold pb-2 text-left">Ticker</th>
                                    <th className="font-bold pb-2">3M</th>
                                    <th className="font-bold pb-2">6M</th>
                                    <th className="font-bold pb-2">9M</th>
                                    <th className="font-bold pb-2">1Y</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.momentumMetrics.rows.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td className="py-2 text-left font-bold">{row.ticker}</td>
                                        <td className={`py-2 ${row.m3.includes('-') ? 'text-red-500' : 'text-green-600'}`}>{row.m3}</td>
                                        <td className={`py-2 ${row.m6.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{row.m6}</td>
                                        <td className={`py-2 ${row.m9.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{row.m9}</td>
                                        <td className={`py-2 ${row.y1.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{row.y1}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div>
                            <h4 className="text-gray-500 text-lg mb-2">52 Week Range</h4>
                            <div className="relative pt-4 pb-2">
                                <div className="h-1 bg-gray-200 w-full rounded relative">
                                    <div
                                        className="absolute h-3 w-3 bg-gray-500 rounded-full top-1/2 transform -translate-y-1/2"
                                        style={{ left: `${((data.momentumMetrics.lastPrice - data.momentumMetrics.rangeLow) / (data.momentumMetrics.rangeHigh - data.momentumMetrics.rangeLow)) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>{data.momentumMetrics.rangeLow}</span>
                                    <span className="text-black font-semibold">Last price: {data.momentumMetrics.lastPrice}</span>
                                    <span>{data.momentumMetrics.rangeHigh}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SummaryCard>
            </div>

            {/* ROW 4: Capital Structure(Left Top), Trading Data(Left Bottom) & Dividends(Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column Container */}
                <div className="flex flex-col gap-6">
                    {/* Capital Structure */}
                    <SummaryCard title="Capital Structure">
                        <div className="space-y-1">
                            {data.capitalStructure.map((row: any, i: number) => (
                                <DataRow key={i} label={row.label} value={row.value} />
                            ))}
                        </div>
                    </SummaryCard>

                    {/* Trading Data */}
                    <SummaryCard title="Trading Data">
                        <div className="space-y-1">
                            {data.tradingDataValues.map((row: any, i: number) => (
                                <DataRow key={i} label={row.label} value={row.value} />
                            ))}
                        </div>
                    </SummaryCard>
                </div>

                {/* Right Column Container */}
                <div className="flex flex-col h-full">
                    {/* Dividends */}
                    <SummaryCard title="Dividends" linkText="More On Dividends" className="h-full">
                        <div className="space-y-1">
                            {data.dividendsData.rows.map((row: any, i: number) => (
                                <DataRow key={i} label={row.label} value={row.value} />
                            ))}
                        </div>
                    </SummaryCard>
                </div>

            </div>

            {/* ROW 6: Dividend Growth History */}
            <div>
                <SummaryCard title="Dividend Growth History" linkText="More On Dividend Growth">
                    <div className="h-[200px] flex items-end justify-between gap-4 px-4 pt-10 relative">
                        {/* Simple Bar Chart */}
                        {[0.04, 0.02, 0.00].map((tick, i) => (
                            <div key={i} className="absolute w-full border-t border-gray-100 left-0 text-right pr-2 text-xs text-gray-400"
                                style={{ bottom: `${(tick / 0.045) * 100}%` }}>
                                {tick === 0 ? '$0.00' : `$${tick.toFixed(2)}`}
                            </div>
                        ))}

                        {data.dividendGrowthHistory.map((item: any, i: number) => {
                            // Assuming max value roughly 0.045 for scaling
                            const heightPercent = (item.value / 0.045) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group z-10">
                                    <div
                                        className="w-full bg-gray-600 rounded-t-sm hover:bg-gray-800 transition-colors relative"
                                        style={{ height: `${heightPercent}%`, maxWidth: '40px' }}
                                    >
                                        <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                                            {item.value}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2">{item.year}</span>
                                </div>
                            )
                        })}
                    </div>
                </SummaryCard>
            </div>

            {/* ROW 7: Financial Statements Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryCard title="Income Statement" linkText="Full Income Statement">
                    <div className="space-y-1">
                        {data.financialsSummary.income.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>

                <SummaryCard title="Balance Sheet" linkText="Full Balance Sheet">
                    <div className="space-y-1">
                        {data.financialsSummary.balanceSheet.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>

                <SummaryCard title="Cash Flow Statement" linkText="Full Cash Flow Statement">
                    <div className="space-y-1">
                        {data.financialsSummary.cashFlow.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>

                <SummaryCard title="Long Term Solvency">
                    <div className="space-y-1">
                        {data.financialsSummary.solvency.map((row: any, i: number) => (
                            <DataRow key={i} label={row.label} value={row.value} />
                        ))}
                    </div>
                </SummaryCard>
            </div>

        </div>
    );
}
