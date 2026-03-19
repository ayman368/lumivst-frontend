'use client';

const ipoData = {
  article: {
    title: 'The IPO Buzz: Swarmer (SWMR) Prices Small IPO at $5 Mid-Point & Stock Soars on NASDAQ',
    date: 'March 17, 2026',
    content: 'Austin, Texas-based Swarmer (SWMR) priced its small IPO at $5.00 – the mid-point of its $4.00-to-$6.00 range – and sold 3 million shares – the number of shares in the prospectus – to raise $15 million on Monday night, March 16, 2026. Swarmer\'s stock surged in its NASDAQ debut today – Tuesday, March 17, 2026 – opening at $12.50 and then hitting an intraday high of $32.45.'
  },
  calendar: [
    {
      company: 'Swarmer, Inc.',
      symbol: 'SWMR',
      leadManagers: 'Lucid Capital Markets',
      shares: '3.0',
      priceLow: '5.00',
      priceHigh: '5.00',
      estVolume: '$ 15.0 mil',
      expectedTrade: '3/16/2026 Priced',
      scoopRating: 'S/O',
      ratingChange: 'S/O'
    },
    {
      company: 'Brookline Capital Acquisition Corp. II',
      symbol: 'BCACU',
      leadManagers: 'Brookline Capital Markets (A Division of Arcadia Securities, LLC)',
      shares: '10.0',
      priceLow: '10.00',
      priceHigh: '10.00',
      estVolume: '$ 100.0 mil',
      expectedTrade: '3/19/2026 Week of',
      scoopRating: 'S/O',
      ratingChange: 'S/O'
    },
    {
      company: 'Guardian Metal Resources PLC (Uplisting)',
      symbol: 'GMTL',
      leadManagers: 'BMO Capital Markets/Cantor',
      shares: '3.1',
      priceLow: '16.35',
      priceHigh: '16.35',
      estVolume: '$ 50.0 mil',
      expectedTrade: '3/20/2026 Friday',
      scoopRating: 'S/O',
      ratingChange: 'S/O'
    }
  ],
  last100: {
    numberPriced: '100',
    numberUp: '40',
    numberDown: '55',
    numberUnchanged: '5',
    percentChange: '-14.20%',
    nasdaqChange: '35.22%'
  },
  scorecard2026: {
    numberPriced: '37',
    numberUp: '15',
    numberDown: '19',
    numberUnchanged: '3',
    totalReturn: '-1.14%',
    nasdaqYTD: '35.22%'
  }
};

export default function InitialPublicOfferingsPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#131722',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#d1d4dc',
            marginBottom: '8px',
          }}>
            Initial Public Offerings
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
          }}>
            Track the latest IPO news, upcoming IPOs, and market performance data.
          </p>
        </div>

        {/* IPO Buzz Article */}
        <div style={{
          marginBottom: '40px',
          padding: '24px',
          background: '#1e222d',
          borderRadius: '12px',
          border: '1px solid #2a2e39',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#d1d4dc',
              margin: 0,
              maxWidth: '80%',
            }}>
              {ipoData.article.title}
            </h2>
            <span style={{
              fontSize: '12px',
              color: '#787b86',
              whiteSpace: 'nowrap',
              marginLeft: '16px',
            }}>
              {ipoData.article.date}
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#a9aaad',
            lineHeight: '1.6',
            margin: 0,
          }}>
            {ipoData.article.content}
          </p>
        </div>

        {/* IPO Calendar */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 600,
            color: '#d1d4dc',
            marginBottom: '20px',
          }}>
            IPO Calendar
          </h2>
          <div style={{
            overflowX: 'auto',
            background: '#1e222d',
            borderRadius: '12px',
            border: '1px solid #2a2e39',
            padding: '16px',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2a2e39' }}>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'left',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                    borderRadius: '8px 0 0 0',
                  }}>Company</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>Symbol</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'left',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>Lead Managers</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>Shares (M)</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>Price</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>Est. $ Volume</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>Expected to Trade</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                  }}>SCOOP Rating</th>
                  <th style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    color: '#d1d4dc',
                    fontWeight: 600,
                    backgroundColor: '#2a2e39',
                    borderRadius: '0 8px 0 0',
                  }}>Rating Change</th>
                </tr>
              </thead>
              <tbody>
                {ipoData.calendar.map((ipo, idx) => (
                  <tr key={idx} style={{
                    borderBottom: '1px solid #2a2e39',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(200, 200, 200, 0.03)',
                  }}>
                    <td style={{ padding: '12px 8px', color: '#787b86' }}>{ipo.company}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#00b894', fontWeight: 500 }}>{ipo.symbol}</td>
                    <td style={{ padding: '12px 8px', color: '#787b86' }}>{ipo.leadManagers}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{ipo.shares}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>${ipo.priceLow}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{ipo.estVolume}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86', fontSize: '11px' }}>{ipo.expectedTrade}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{ipo.scoopRating}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{ipo.ratingChange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {/* Last 100 IPOs */}
          <div style={{
            padding: '24px',
            background: '#1e222d',
            borderRadius: '12px',
            border: '1px solid #2a2e39',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#d1d4dc',
              marginBottom: '20px',
            }}>
              Last 100 IPOs - March 16, 2026
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number of IPOs priced:</span>
                <span style={{ color: '#d1d4dc', fontWeight: 600 }}>{ipoData.last100.numberPriced}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number Up:</span>
                <span style={{ color: '#00b894', fontWeight: 600 }}>{ipoData.last100.numberUp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number Down:</span>
                <span style={{ color: '#ff7675', fontWeight: 600 }}>{ipoData.last100.numberDown}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number Unchanged:</span>
                <span style={{ color: '#d1d4dc', fontWeight: 600 }}>{ipoData.last100.numberUnchanged}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Percentage Change From Issue Price:</span>
                <span style={{ color: '#ff7675', fontWeight: 600 }}>{ipoData.last100.percentChange}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#787b86' }}>Nasdaq Composite % Change:</span>
                <span style={{ color: '#00b894', fontWeight: 600 }}>{ipoData.last100.nasdaqChange}</span>
              </div>
            </div>
          </div>

          {/* 2026 IPO Scorecard */}
          <div style={{
            padding: '24px',
            background: '#1e222d',
            borderRadius: '12px',
            border: '1px solid #2a2e39',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#d1d4dc',
              marginBottom: '20px',
            }}>
              2026 IPO Scorecard - March 16, 2026
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number of IPOs priced (Excl. 52 units):</span>
                <span style={{ color: '#d1d4dc', fontWeight: 600 }}>{ipoData.scorecard2026.numberPriced}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number Up:</span>
                <span style={{ color: '#00b894', fontWeight: 600 }}>{ipoData.scorecard2026.numberUp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number Down:</span>
                <span style={{ color: '#ff7675', fontWeight: 600 }}>{ipoData.scorecard2026.numberDown}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Number Unchanged:</span>
                <span style={{ color: '#d1d4dc', fontWeight: 600 }}>{ipoData.scorecard2026.numberUnchanged}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #2a2e39' }}>
                <span style={{ color: '#787b86' }}>Total Return From Issue Price:</span>
                <span style={{ color: '#ff7675', fontWeight: 600 }}>{ipoData.scorecard2026.totalReturn}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#787b86' }}>Nasdaq Composite Index YTD % Change:</span>
                <span style={{ color: '#00b894', fontWeight: 600 }}>{ipoData.scorecard2026.nasdaqYTD}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
