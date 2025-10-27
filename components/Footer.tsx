import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Navigation */}
          <div className="footer-column">
            <h3>التنقل</h3>
            <ul className="footer-links">
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/dashboard">لوحة التحكم</Link></li>
              <li><Link href="/portfolios">المحافظ</Link></li>
              <li><Link href="/membership">العضوية</Link></li>
              <li><Link href="/about">من نحن</Link></li>
            </ul>
          </div>

          {/* News */}
          <div className="footer-column">
            <h3>الأخبار</h3>
            <ul className="footer-links">
              <li><Link href="/news">الأخبار</Link></li>
              <li><Link href="/all-news">جميع الأخبار</Link></li>
              <li><Link href="/earning-reports">تقارير الأرباح</Link></li>
              <li><Link href="/disclosures">الإفصاحات</Link></li>
              <li><Link href="/analyst-reports">تقارير المحللين</Link></li>
            </ul>
          </div>

          {/* Market */}
          <div className="footer-column">
            <h3>السوق</h3>
            <ul className="footer-links">
              <li><Link href="/market">السوق</Link></li>
              <li><Link href="/economy">الاقتصاد</Link></li>
              <li><Link href="/us-market">السوق الأمريكي</Link></li>
              <li><Link href="/sa-market">السوق السعودي</Link></li>
              <li><Link href="/sectors">القطاعات</Link></li>
            </ul>
          </div>

          {/* Analysis */}
          <div className="footer-column">
            <h3>التحليل</h3>
            <ul className="footer-links">
              <li><Link href="/analysis">التحليل</Link></li>
              <li><Link href="/companies">الشركات</Link></li>
              <li><Link href="/ipo">الاكتتابات</Link></li>
              <li><Link href="/mutual-funds">الصناديق</Link></li>
              <li><Link href="/analysts">المحللون</Link></li>
            </ul>
          </div>

          {/* Screeners */}
          <div className="footer-column">
            <h3>المصافي</h3>
            <ul className="footer-links">
              <li><Link href="/screeners">المصافي</Link></li>
              <li><Link href="/fundamental">الأساسيات</Link></li>
              <li><Link href="/technical">الفني</Link></li>
              <li><Link href="/top-traders">كبار المتداولين</Link></li>
              <li><Link href="/my-screens">مصافيي</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>© 2024 سهم LUMIVST جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}