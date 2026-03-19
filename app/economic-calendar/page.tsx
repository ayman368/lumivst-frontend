'use client';

const economicData = [
  {
    event: 'Producer/Import Price MM*',
    country: 'CH',
    eventTime: '7:30 AM UTC',
    for: 'Feb',
    actual: '-0.3',
    marketExpectation: '-',
    priorToThis: '-0.2',
    revisedFrom: '-'
  },
  {
    event: 'Producer/Import Price YY*',
    country: 'CH',
    eventTime: '7:30 AM UTC',
    for: 'Feb',
    actual: '-2.7',
    marketExpectation: '-',
    priorToThis: '-2.2',
    revisedFrom: '-'
  },
  {
    event: 'Loan YY*',
    country: 'ID',
    eventTime: '7:30 AM UTC',
    for: 'Feb',
    actual: '9.37',
    marketExpectation: '-',
    priorToThis: '9.96',
    revisedFrom: '-'
  },
  {
    event: 'Consumer Prices Final YY*',
    country: 'IT',
    eventTime: '9:00 AM UTC',
    for: 'Feb',
    actual: '1.5',
    marketExpectation: '-',
    priorToThis: '1.6',
    revisedFrom: '-'
  },
  {
    event: 'CPI (EU Norm) Final MM*',
    country: 'IT',
    eventTime: '9:00 AM UTC',
    for: 'Feb',
    actual: '0.5',
    marketExpectation: '-',
    priorToThis: '0.6',
    revisedFrom: '-'
  },
  {
    event: 'CPI (EU Norm) Final YY*',
    country: 'IT',
    eventTime: '9:00 AM UTC',
    for: 'Feb',
    actual: '1.5',
    marketExpectation: '-',
    priorToThis: '1.6',
    revisedFrom: '-'
  },
  {
    event: 'Consumer Prices Final MM*',
    country: 'IT',
    eventTime: '9:00 AM UTC',
    for: 'Feb',
    actual: '0.7',
    marketExpectation: '-',
    priorToThis: '0.8',
    revisedFrom: '-'
  },
  {
    event: 'ZEW Current Conditions',
    country: 'DE',
    eventTime: '10:00 AM UTC',
    for: 'Mar',
    actual: '-62.9',
    marketExpectation: '-',
    priorToThis: '-65.9',
    revisedFrom: '-'
  },
  {
    event: 'ZEW Economic Sentiment',
    country: 'DE',
    eventTime: '10:00 AM UTC',
    for: 'Mar',
    actual: '-0.5',
    marketExpectation: '-',
    priorToThis: '58.3',
    revisedFrom: '-'
  },
  {
    event: 'Imports - USD*',
    country: 'IL',
    eventTime: '11:00 AM UTC',
    for: 'Feb',
    actual: '8812.2',
    marketExpectation: '-',
    priorToThis: '8240.3',
    revisedFrom: '8201.9'
  },
  {
    event: 'Trade Balance - USD*',
    country: 'IL',
    eventTime: '11:00 AM UTC',
    for: 'Feb',
    actual: '-4353.6',
    marketExpectation: '-',
    priorToThis: '-3135.3',
    revisedFrom: '-3039.4'
  },
  {
    event: 'Exports - USD*',
    country: 'IL',
    eventTime: '11:00 AM UTC',
    for: 'Feb',
    actual: '4458.6',
    marketExpectation: '-',
    priorToThis: '5162.5',
    revisedFrom: '-'
  },
  {
    event: 'Redbook YY *',
    country: 'US',
    eventTime: '12:55 PM UTC',
    for: '-',
    actual: '6.4',
    marketExpectation: '-',
    priorToThis: '6.2',
    revisedFrom: '-'
  },
  {
    event: 'CPI YY*',
    country: 'KW',
    eventTime: '1:00 PM UTC',
    for: 'Jan',
    actual: '1.99',
    marketExpectation: '-',
    priorToThis: '2.07',
    revisedFrom: '-'
  },
  {
    event: 'Pending Sales Change MM',
    country: 'US',
    eventTime: '2:00 PM UTC',
    for: 'Feb',
    actual: '1.8',
    marketExpectation: '-',
    priorToThis: '-0.8',
    revisedFrom: '-1'
  },
  {
    event: 'Pending Homes Index',
    country: 'US',
    eventTime: '2:00 PM UTC',
    for: 'Feb',
    actual: '72.1',
    marketExpectation: '-',
    priorToThis: '70.9',
    revisedFrom: '70.8'
  },
  {
    event: 'Westpac Consumer Survey*',
    country: 'NZ',
    eventTime: '8:00 PM UTC',
    for: 'Q1',
    actual: '94.7',
    marketExpectation: '-',
    priorToThis: '96.5',
    revisedFrom: '-'
  },
  {
    event: 'Current Account- Annual',
    country: 'NZ',
    eventTime: '9:45 PM UTC',
    for: 'Q4',
    actual: '-16.35',
    marketExpectation: '-',
    priorToThis: '-15.37',
    revisedFrom: '-'
  },
  {
    event: 'Current Account/GDP',
    country: 'NZ',
    eventTime: '9:45 PM UTC',
    for: 'Q4',
    actual: '-3.7',
    marketExpectation: '-',
    priorToThis: '-3.5',
    revisedFrom: '-'
  },
  {
    event: 'Current Account-Only',
    country: 'NZ',
    eventTime: '9:45 PM UTC',
    for: 'Q4',
    actual: '-5.98',
    marketExpectation: '-',
    priorToThis: '-8.36',
    revisedFrom: '-'
  },
  {
    event: 'Reuters Tankan ManY Idx',
    country: 'JP',
    eventTime: '11:00 PM UTC',
    for: 'Mar',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '13',
    revisedFrom: '-'
  },
  {
    event: 'Unemployment Rate',
    country: 'KR',
    eventTime: '11:00 PM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '3',
    revisedFrom: '-'
  },
  {
    event: 'Exports YY',
    country: 'JP',
    eventTime: '11:50 PM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '16.8',
    revisedFrom: '-'
  },
  {
    event: 'Trade Balance-Total Yen',
    country: 'JP',
    eventTime: '11:50 PM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '-1162.7',
    revisedFrom: '-1163.5'
  },
  {
    event: 'Imports YY',
    country: 'JP',
    eventTime: '11:50 PM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '-2.5',
    revisedFrom: '-2.6'
  },
  {
    event: 'CPI MM*',
    country: 'OM',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '0.22',
    revisedFrom: '-'
  },
  {
    event: 'Budget Balance Ytd*',
    country: 'OM',
    eventTime: '12:00 AM UTC',
    for: 'Dec',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '-449',
    revisedFrom: '-'
  },
  {
    event: 'CPI YY*',
    country: 'OM',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '1.4',
    revisedFrom: '-'
  },
  {
    event: 'Infrastructure Output YY*',
    country: 'IN',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '4',
    revisedFrom: '-'
  },
  {
    event: 'Trade Balance Ytd*',
    country: 'UA',
    eventTime: '12:00 AM UTC',
    for: 'Oct',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '-30.6',
    revisedFrom: '-'
  },
  {
    event: 'Federal Tax Revenue*',
    country: 'BR',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '325.75',
    revisedFrom: '-'
  },
  {
    event: 'Total Credit YY*',
    country: 'QA',
    eventTime: '12:00 AM UTC',
    for: '-',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '4.9',
    revisedFrom: '-'
  },
  {
    event: 'M2 Money Supply YY*',
    country: 'QA',
    eventTime: '12:00 AM UTC',
    for: 'Jan',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '3.5',
    revisedFrom: '-'
  },
  {
    event: 'CPI YY*',
    country: 'QA',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '2.28',
    revisedFrom: '-'
  },
  {
    event: 'M2 Money Supply YY*',
    country: 'OM',
    eventTime: '12:00 AM UTC',
    for: 'Dec',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '6.4',
    revisedFrom: '-'
  },
  {
    event: 'Pvt Bank Lending YY*',
    country: 'KW',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '7.06',
    revisedFrom: '-'
  },
  {
    event: 'M2 Money Supply YY*',
    country: 'KW',
    eventTime: '12:00 AM UTC',
    for: 'Feb',
    actual: '-',
    marketExpectation: '-',
    priorToThis: '3.62',
    revisedFrom: '-'
  }
];

export default function EconomicCalendarPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#131722',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#d1d4dc',
            marginBottom: '8px',
          }}>
            Economic Calendar
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
          }}>
            Track key economic events and indicators that impact global markets.
          </p>
        </div>

        {/* Economic Calendar Table */}
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
            minWidth: '1200px',
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
                }}>Event</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Country</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Event Time</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>For</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Actual</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Market Expectation</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                }}>Prior to This</th>
                <th style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  color: '#d1d4dc',
                  fontWeight: 600,
                  backgroundColor: '#2a2e39',
                  borderRadius: '0 8px 0 0',
                }}>Revised from</th>
              </tr>
            </thead>
            <tbody>
              {economicData.map((row, idx) => (
                <tr key={idx} style={{
                  borderBottom: '1px solid #2a2e39',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(200, 200, 200, 0.03)',
                }}>
                  <td style={{ padding: '12px 8px', color: '#a9aaad', maxWidth: '250px' }}>{row.event}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#00b894', fontWeight: 500 }}>{row.country}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86', fontSize: '11px' }}>{row.eventTime}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{row.for}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#d1d4dc', fontWeight: 500 }}>{row.actual}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{row.marketExpectation}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{row.priorToThis}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#787b86' }}>{row.revisedFrom}</td>
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
            <strong style={{ color: '#d1d4dc' }}>Legend:</strong> Events marked with * indicate revised or forecasted data. Event times are shown in UTC. "-" indicates data not available or not applicable.
          </p>
        </div>
      </div>
    </div>
  );
}
