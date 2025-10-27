import Link from 'next/link'
import LimitSelector from './LimitSelector'

// دالة محسنة لتنظيف الرموز - تتعامل مع جميع الحالات
function cleanSymbol(symbol: string): string {
  if (!symbol) return '';
  
  if (symbol.includes('.')) {
    return symbol.split('.')[0].toUpperCase().trim();
  }
  
  const match = symbol.match(/^\d+/);
  if (match) {
    return match[0];
  }
  
  return symbol.toUpperCase().trim();
}

async function getStocks(page: number = 1, limit: number = 25) {
  // استخدام remove_duplicates=true علشان الخادم يصفى البيانات
  const res = await fetch(`lumivst-frontend.vercel.app/stocks?page=${page}&limit=${limit}&remove_duplicates=true`, { 
    cache: 'no-store' // لا تخزن علشان نحصل على أحدث البيانات
  })
  
  if (!res.ok) {
    console.error(`❌ فشل جلب البيانات: ${res.status}`)
    throw new Error('Failed to fetch stocks')
  }
  
  return res.json()
}

export default async function StocksPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string, limit?: string }>
}) {
  const { page, limit } = await searchParams
  const currentPage = parseInt(page || '1')
  const currentLimit = parseInt(limit || '25')
  
  // جلب البيانات المصفاة مباشرة من الخادم مع الـ pagination
  const { data: stocks, pagination } = await getStocks(currentPage, currentLimit)
  const { total_pages, total } = pagination

  const startItem = (currentPage - 1) * currentLimit + 1
  const endItem = Math.min(currentPage * currentLimit, total)

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="card">
        <div className="card-header">
          {/* <div>
            <h1 className="card-title">جميع الأسهم ({total})</h1>
            <p className="text-muted mt-2">قائمة كاملة بالأسهم المدرجة في السوق السعودي</p>
            <p className="text-xs text-green-600 mt-1">✅ تمت إزالة التكرار تلقائياً من الخادم</p>
          </div> */}
        </div>

<div className="overflow-x-auto">
  <table className="table">
    <thead>
      <tr>
        <th>الرمز</th>
        <th>اسم السهم</th>
        <th>السوق</th>
        {/* إخفاء الأعمدة */}
        {/* <th>العملة</th> */}
        {/* <th>النوع</th> */}
        {/* <th>الإجراءات</th> */}
      </tr>
    </thead>
    <tbody>
      {stocks.map((stock: any) => {
        const cleanSym = cleanSymbol(stock.symbol)
        const displaySymbol = cleanSym
        const hasOriginalSymbol = stock.original_symbol && stock.original_symbol !== cleanSym
        
        return (
          <tr key={stock.symbol}>
            <td className="font-semibold">
              <Link href={`/stocks/${cleanSym}`} className="text-gray-900 hover:text-blue-600 hover:underline">
                {displaySymbol}
                {hasOriginalSymbol && (
                  <div className="text-xs text-muted">(الرمز الأصلي: {stock.original_symbol})</div>
                )}
              </Link>
            </td>
            <td>
              <Link href={`/stocks/${cleanSym}`} className="text-gray-900 hover:text-blue-600 hover:underline">
                {stock.name}
              </Link>
            </td>
            <td>{stock.exchange}</td>
            {/* إخفاء الأعمدة */}
            {/* <td>{stock.currency}</td> */}
            {/* <td>
              <span className="text-muted">{stock.type}</span>
            </td> */}
            {/* <td>
              <Link 
                href={`/stocks/${cleanSym}`}  
                className="btn btn-outline btn-sm"
              >
                عرض التفاصيل
              </Link>
            </td> */}
          </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          {/* Left: Items per page */}
          <div className="flex items-center gap-2">
            <span className="pagination-info">عناصر في الصفحة</span>
            <LimitSelector currentLimit={currentLimit} />
          </div>

          {/* Center: Items count */}
          <div className="pagination-info">
            {startItem}-{endItem} من {total} عنصر
          </div>

          {/* Right: Pagination */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {currentPage > 1 && (
                <Link 
                  href={`/stocks?page=${currentPage - 1}&limit=${currentLimit}`}
                  className="pagination-button"
                >
                  السابق
                </Link>
              )}
              
              <span className="pagination-current">
                {currentPage} من {total_pages}
              </span>
              
              {currentPage < total_pages && (
                <Link 
                  href={`/stocks?page=${currentPage + 1}&limit=${currentLimit}`}
                  className="pagination-button"
                >
                  التالي
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}












        // <div className="overflow-x-auto">
        //   <table className="table">
        //     <thead>
        //       <tr>
        //         <th>الرمز</th>
        //         <th>اسم السهم</th>
        //         <th>السوق</th>
        //         <th>العملة</th>
        //         <th>النوع</th>
        //         <th>الإجراءات</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {stocks.map((stock: any) => {
        //         const cleanSym = cleanSymbol(stock.symbol)
        //         const displaySymbol = cleanSym
        //         const hasOriginalSymbol = stock.original_symbol && stock.original_symbol !== cleanSym
                
        //         return (
        //           <tr key={stock.symbol}>
        //             <td className="font-semibold">
        //               {displaySymbol}
        //               {hasOriginalSymbol && (
        //                 <div className="text-xs text-muted">(الرمز الأصلي: {stock.original_symbol})</div>
        //               )}
        //             </td>
        //             <td>{stock.name}</td>
        //             <td>{stock.exchange}</td>
        //             <td>{stock.currency}</td>
        //             <td>
        //               <span className="text-muted">{stock.type}</span>
        //             </td>
        //             <td>
        //               <Link 
        //                 href={`/stocks/${cleanSym}`}  
        //                 className="btn btn-outline btn-sm"
        //               >
        //                 عرض التفاصيل
        //               </Link>
        //             </td>
        //           </tr>