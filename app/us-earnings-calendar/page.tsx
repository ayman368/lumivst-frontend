'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

const earningsData = [
  {
    symbol: 'EBLT',
    company: 'Elbit Systems Ltd.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 2.82,
    reportedEps: 3.52,
    surprise: 26.04,
    marketCap: 47.13,
    followed: false
  },
  {
    symbol: 'TME',
    company: 'Tencent Music Entertainment Group',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 1.59,
    reportedEps: 1.6,
    surprise: 0.45,
    marketCap: 19.15,
    followed: false
  },
  {
    symbol: 'ZTO',
    company: 'ZTO Express (Cayman) Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: 3.15,
    reportedEps: '-',
    surprise: '-',
    marketCap: 18.11,
    followed: false
  },
  {
    symbol: 'GDS',
    company: 'GDS Holdings Limited',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 12.32,
    reportedEps: 5.88,
    surprise: -52.23,
    marketCap: 8.87,
    followed: false
  },
  {
    symbol: 'NGD',
    company: 'New Gold Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: 0.23,
    reportedEps: '-',
    surprise: '-',
    marketCap: 8.21,
    followed: false
  },
  {
    symbol: 'ATAT',
    company: 'Atour Lifestyle Holdings Limited',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 3.22,
    reportedEps: 3.55,
    surprise: 10.12,
    marketCap: 5.12,
    followed: false
  },
  {
    symbol: 'CAAP',
    company: 'Corporación América Airports S.A.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 0.42,
    reportedEps: 0.65,
    surprise: 56.36,
    marketCap: 4.17,
    followed: false
  },
  {
    symbol: 'QFIN',
    company: 'Qfin Holdings, Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: 8.21,
    reportedEps: '-',
    surprise: '-',
    marketCap: 1.99,
    followed: false
  },
  {
    symbol: 'GLUE',
    company: 'Monte Rosa Therapeutics, Inc.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: -0.34,
    reportedEps: -0.55,
    surprise: -63.38,
    marketCap: 1.22,
    followed: false
  },
  {
    symbol: 'DEC',
    company: 'Diversified Energy Company',
    eventName: 'H2 2025 Earnings Announcement',
    earningsCallTime: 'TNS',
    epsEstimate: '-',
    reportedEps: '-',
    surprise: '-',
    marketCap: 1.11,
    followed: false
  },
  {
    symbol: 'JRMY',
    company: 'JRMY Inc.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: '-',
    reportedEps: 0.16,
    surprise: -0.51,
    marketCap: 703.73,
    followed: false
  },
  {
    symbol: 'SLDB',
    company: 'Solid Biosciences Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.52,
    reportedEps: '-',
    surprise: '-',
    marketCap: 604.58,
    followed: false
  },
  {
    symbol: 'BLMM',
    company: 'Blue Moon Metals Inc.',
    eventName: 'Q4 2024 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: '-',
    reportedEps: '-',
    surprise: '-',
    marketCap: 463.77,
    followed: false
  },
  {
    symbol: 'CTBN',
    company: 'Citi Trends, Inc.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 0.78,
    reportedEps: 0.85,
    surprise: 10.18,
    marketCap: 431.17,
    followed: false
  },
  {
    symbol: 'VORG',
    company: 'VorgTech Corp.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: '-',
    reportedEps: '-',
    surprise: '-',
    marketCap: 409.78,
    followed: false
  },
  {
    symbol: 'DMAC',
    company: 'DiaMediaca Therapeutics Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.18,
    reportedEps: '-',
    surprise: '-',
    marketCap: 372.87,
    followed: false
  },
  {
    symbol: 'XFOR',
    company: 'X4 Pharmaceuticals, Inc.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: -0.35,
    reportedEps: -0.22,
    surprise: -36.69,
    marketCap: 369.86,
    followed: false
  },
  {
    symbol: 'BCYC',
    company: 'Bicycle Therapeutics plc',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: -0.95,
    reportedEps: -0.29,
    surprise: 69.62,
    marketCap: 351.7,
    followed: false
  },
  {
    symbol: 'HPT',
    company: 'Hexion Holding Limited',
    eventName: 'H1 2026 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: '-',
    reportedEps: '-',
    surprise: '-',
    marketCap: 349.41,
    followed: false
  },
  {
    symbol: 'NFE',
    company: 'New Fortress Energy Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: '-1.08',
    reportedEps: '-',
    surprise: '-',
    marketCap: 325.94,
    followed: false
  },
  {
    symbol: 'SWMH',
    company: 'SWK Holdings Corporation',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: 0.52,
    reportedEps: '-',
    surprise: '-',
    marketCap: 206.24,
    followed: false
  },
  {
    symbol: 'USBC',
    company: 'USBC, Inc.',
    eventName: 'Q1 2026 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -2.8,
    reportedEps: '-',
    surprise: '-',
    marketCap: 157.7,
    followed: false
  },
  {
    symbol: 'CODA',
    company: 'Coda Octopus Group, Inc.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: 0.06,
    reportedEps: 0.08,
    surprise: 33.33,
    marketCap: 155.08,
    followed: false
  },
  {
    symbol: 'MEDV',
    company: 'Modiv Industrial, Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: 0.05,
    reportedEps: '-',
    surprise: '-',
    marketCap: 150.32,
    followed: false
  },
  {
    symbol: 'SGMO',
    company: 'Sangamo Therapeutics, Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.05,
    reportedEps: '-',
    surprise: '-',
    marketCap: 141.24,
    followed: false
  },
  {
    symbol: 'ELBM',
    company: 'Electra Battery Materials Corporation',
    eventName: 'Q2 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.19,
    reportedEps: '-',
    surprise: '-',
    marketCap: 65.57,
    followed: false
  },
  {
    symbol: 'NRXP',
    company: 'NIRx Pharmaceuticals, Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.08,
    reportedEps: '-',
    surprise: '-',
    marketCap: 62.15,
    followed: false
  },
  {
    symbol: 'PSQH',
    company: 'PSQ Holdings, Inc.',
    eventName: '-',
    earningsCallTime: 'TAS',
    epsEstimate: -0.19,
    reportedEps: -0.25,
    surprise: -31.58,
    marketCap: 38.41,
    followed: false
  },
  {
    symbol: 'SDST',
    company: 'Stardust Power Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.45,
    reportedEps: '-',
    surprise: '-',
    marketCap: 27.93,
    followed: false
  },
  {
    symbol: 'ORCGA',
    company: 'ORC Group Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: '-',
    reportedEps: '-',
    surprise: '-',
    marketCap: 26.43,
    followed: false
  },
  {
    symbol: 'CDIO',
    company: 'Cardio Diagnostics Holdings, Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -1.8,
    reportedEps: '-',
    surprise: '-',
    marketCap: 4.11,
    followed: false
  },
  {
    symbol: 'ADAP',
    company: 'Adaptiummune Therapeutics plc',
    eventName: 'Q3 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.12,
    reportedEps: '-',
    surprise: '-',
    marketCap: '-',
    followed: false
  },
  {
    symbol: 'KNWR',
    company: 'Knower Labs, Inc.',
    eventName: 'Q1 2026 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -2.8,
    reportedEps: '-',
    surprise: '-',
    marketCap: '-',
    followed: false
  },
  {
    symbol: 'ZYXI',
    company: 'Zynex, Inc.',
    eventName: 'Q4 2025 Earnings Announcement',
    earningsCallTime: 'AMC',
    epsEstimate: -0.18,
    reportedEps: '-',
    surprise: '-',
    marketCap: '-',
    followed: false
  }
];

export default function USEarningsCalendarPage() {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const toggleFollow = (symbol: string) => {
    setFollowed(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  const getValueColor = (value: number | string) => {
    if (typeof value === 'string') return '#787b86';
    if (value > 0) return '#00b894';
    if (value < 0) return '#ff7675';
    return '#d1d4dc';
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#131722',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#d1d4dc',
            marginBottom: '8px',
          }}>
            US Earnings Calendar
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
          }}>
            Track upcoming earnings reports and compare EPS estimates with actual results.
          </p>
        </div>

        {/* Earnings Calendar Table */}
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
            minWidth: '1400px',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2a2e39' }}>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                  borderRadius: '8px 0 0 0',
                  width: '60px',
                }}>Symbol</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Company</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Event Name</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Earnings Call Time</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>EPS Estimate</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Reported EPS</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Surprise (%)</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Market Cap</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                  borderRadius: '0 8px 0 0',
                  width: '60px',
                }}>Follow</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.map((row, idx) => (
                <tr key={idx} style={{
                  borderBottom: '1px solid #2a2e39',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(200, 200, 200, 0.03)',
                }}>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center', 
                    color: '#00b894', 
                    fontWeight: 600,
                    fontSize: '13px'
                  }}>
                    {row.symbol}
                  </td>
                  <td style={{ padding: '12px 8px', color: '#a9aaad', maxWidth: '250px' }}>
                    {row.company}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86', fontSize: '11px' }}>
                    {row.eventName}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>
                    {row.earningsCallTime}
                  </td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center', 
                    color: getValueColor(row.epsEstimate),
                    fontWeight: row.epsEstimate === '-' ? 400 : 500
                  }}>
                    {row.epsEstimate}
                  </td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center', 
                    color: getValueColor(row.reportedEps),
                    fontWeight: row.reportedEps === '-' ? 400 : 500
                  }}>
                    {row.reportedEps}
                  </td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center', 
                    color: getValueColor(row.surprise),
                    fontWeight: row.surprise === '-' ? 400 : 500
                  }}>
                    {row.surprise}
                  </td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center', 
                    color: '#d1d4dc'
                  }}>
                    {row.marketCap}
                  </td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <button
                      onClick={() => toggleFollow(row.symbol)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={followed[row.symbol] ? 'Unfollow' : 'Follow'}
                    >
                      <Heart
                        size={16}
                        style={{
                          fill: followed[row.symbol] ? '#ff7675' : 'none',
                          stroke: followed[row.symbol] ? '#ff7675' : '#787b86',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#1e222d',
          borderRadius: '12px',
          border: '1px solid #2a2e39',
        }}>
          <p style={{
            fontSize: '12px',
            color: '#787b86',
            margin: '0 0 8px 0',
          }}>
            <strong style={{ color: '#d1d4dc' }}>Legend:</strong> Green values indicate positive results. Red values indicate negative results. "-" indicates data not yet available. Click the heart icon to follow companies.
          </p>
        </div>
      </div>
    </div>
  );
}
