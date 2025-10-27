export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">محفظتي</h3>
          <p className="text-gray-600">إدارة ومتابعة محفظتك الاستثمارية</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">الأداء</h3>
          <p className="text-gray-600">تتبع أداء استثماراتك</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">التقارير</h3>
          <p className="text-gray-600">تقارير أداء مفصلة</p>
        </div>
      </div>
    </div>
  )
}