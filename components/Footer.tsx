import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer-gf">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Navigation */}
          <div className="footer-column">
            <h3>Navigation</h3>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/portfolios">Portfolios</Link></li>
              <li><Link href="/membership">Membership</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Screeners & Analysis */}
          <div className="footer-column">
            <h3>Screeners & Analysis</h3>
            <ul className="footer-links">
              <li><Link href="/screeners">Screeners</Link></li>
              <li><Link href="/screeners/fundamental">Fundamental Analysis</Link></li>
              <li><Link href="/screeners/technical">Technical Analysis</Link></li>
              <li><Link href="/insiders">Insiders</Link></li>
            </ul>
          </div>

          {/* Market */}
          <div className="footer-column">
            <h3>Market</h3>
            <ul className="footer-links">
              <li><Link href="/market">Market</Link></li>
              <li><Link href="/market/economy">Economy</Link></li>
              <li><Link href="/market/us">US Market</Link></li>
              <li><Link href="/market/saudi">Saudi Market</Link></li>
              <li><Link href="/market/sectors">Sectors</Link></li>
            </ul>
          </div>

          {/* News & Resources */}
          <div className="footer-column">
            <h3>News & Resources</h3>
            <ul className="footer-links">
              <li><Link href="/news">News</Link></li>
              <li><Link href="/news/earnings">Earning Reports</Link></li>
              <li><Link href="/news/disclosures">Disclosures</Link></li>
              <li><Link href="/news/analyst">Analyst Reports</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>© 2024 LUMIVST. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}