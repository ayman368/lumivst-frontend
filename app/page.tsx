import Link from 'next/link'

async function getStocks() {
  try {
    const res = await fetch('lumivst-frontend-git-main-youssefs-projects-c6c3030a.vercel.app/stocks', { 
      next: { revalidate: 3600 } 
    })
    if (!res.ok) throw new Error('Failed to fetch stocks')
    return res.json()
  } catch (error) {
    console.error('Error fetching stocks:', error)
    return { data: [] }
  }
}



export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-blue">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            منصة الاستثمار بالقيمة الشاملة
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            تقييم دقيق وآلي لجميع الأسهم السعودية. وفر ساعات لا حصر لها في تحليل الأسهم 
            وبناء نماذج خصم التدفقات النقدية بنفسك.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* <Link 
              href="/stocks/2222" 
              className="btn btn-primary text-lg py-3 px-8"
            >
              اطلع على نماذج التقييم
            </Link> */}
            <Link 
              href="/stocks" 
              className="btn btn-outline text-lg py-3 px-8"
            >
              استكشاف جميع الأسهم
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">تحليل مالي متقدم</h3>
            <p className="text-gray-600">
              تحليل شامل للقوائم المالية مع مؤشرات أداء متقدمة
            </p>
          </div>
          
          <div className="card text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">تقييم آلي</h3>
            <p className="text-gray-600">
              نماذج تلقائية لخصم التدفقات النقدية (DCF)
            </p>
          </div>
          
          <div className="card text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">مقارنة ذكية</h3>
            <p className="text-gray-600">
              مقارنة بين multiple stocks وتحليل القطاعات
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}


