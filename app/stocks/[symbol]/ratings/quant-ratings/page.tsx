export default async function QuantRatingsPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const sym = symbol.toUpperCase()

  const factorGrades = [
    { name: 'Valuation', grade: 'F', color: 'bg-red-600' },
    { name: 'Growth', grade: 'A-', color: 'bg-green-700' },
    { name: 'Profitability', grade: 'A-', color: 'bg-green-700' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left: Quant Rating */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-normal text-gray-700">{sym} Quant Rating</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500 text-sm">🔒</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500 text-sm">🔒</span>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-2 font-semibold text-left w-[90px]">1</th>
                    <th className="py-2 font-semibold text-left w-[90px]">2</th>
                    <th className="py-2 font-semibold text-left w-[90px]">3</th>
                    <th className="py-2 font-semibold text-left w-[90px]">4</th>
                    <th className="py-2 font-semibold text-left w-[90px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-gray-600">
                    <td className="py-2">Strong Sell</td>
                    <td className="py-2">Sell</td>
                    <td className="py-2">Hold</td>
                    <td className="py-2">Buy</td>
                    <td className="py-2">Strong Buy</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              The overall quant rating is not an average of the factor grades listed. Instead, it gives greater weight to the metrics with the strongest predictive value.
            </p>
          </div>
        </div>

        {/* Right: Factor Grades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-normal text-gray-700">{sym} Factor Grades</h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-2 text-left">&nbsp;</th>
                    <th className="py-2 text-center w-[110px]">Now</th>
                    <th className="py-2 text-center w-[110px]">3M ago</th>
                    <th className="py-2 text-center w-[110px]">6M ago</th>
                    <th className="py-2 text-right w-[80px]">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {factorGrades.map((row) => (
                    <tr key={row.name} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="py-3 text-center"><span className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-500 text-xs">🔒</span></td>
                      <td className="py-3 text-center"><span className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-500 text-xs">🔒</span></td>
                      <td className="py-3 text-center"><span className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-500 text-xs">🔒</span></td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center justify-center h-6 min-w-6 px-2 rounded text-white text-xs font-bold ${row.color}`}>{row.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
