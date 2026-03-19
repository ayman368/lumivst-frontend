'use client';

import { ExternalLink } from 'lucide-react';

const sources = [
  {
    title: 'US Earnings Calendar',
    description: 'Track upcoming earnings reports for US-listed companies. Stay ahead of market-moving announcements.',
    url: '/us-earnings-calendar',
    color: '#6c5ce7',
  },
  {
    title: 'Economic Calendar',
    description: 'Monitor key economic events, indicators, and data releases that impact global markets.',
    url: '/economic-calendar',
    color: '#0984e3',
  },
  {
    title: 'Initial Public Offerings',
    description: 'Discover upcoming IPOs, pricing details, and performance tracking for newly listed companies.',
    url: '/initial-public-offerings',
    color: '#00b894',
  },
];

export default function UsefulStockSourcesPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#131722',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#d1d4dc',
            marginBottom: '8px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Useful Stock Sources
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
            fontFamily: 'Inter, sans-serif',
          }}>
            Curated collection of essential resources for stock market research and analysis.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gap: '20px',
        }}>
          {sources.map((source) => (
            <a
              key={source.title}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '24px',
                background: '#1e222d',
                borderRadius: '12px',
                border: '1px solid #2a2e39',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = source.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${source.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2e39';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Content */}
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#d1d4dc',
                  marginBottom: '4px',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {source.title}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: '#787b86',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}>
                  {source.description}
                </p>
              </div>

              {/* External Link Icon */}
              <ExternalLink size={20} style={{ color: '#787b86', flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
