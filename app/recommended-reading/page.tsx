'use client';

import { ExternalLink } from 'lucide-react';

const readings = [
  {
    title: 'Dan Zanger – Recommended Reading',
    description: 'A curated list of must-read books and resources recommended by legendary trader Dan Zanger for mastering chart patterns and trading strategies.',
    url: 'https://www.chartpattern.com/recommend-reading.cfm',
    color: '#e17055',
  },
];

export default function RecommendedReadingPage() {
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
            Recommended Reading
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
            fontFamily: 'Inter, sans-serif',
          }}>
            Essential reading materials to enhance your trading knowledge and skills.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gap: '20px',
        }}>
          {readings.map((item) => (
            <a
              key={item.title}
              href={item.url}
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
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${item.color}20`;
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
                  {item.title}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: '#787b86',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}>
                  {item.description}
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
