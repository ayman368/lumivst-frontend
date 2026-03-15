'use client';

import { ExternalLink } from 'lucide-react';

export default function ChartPatternsPage() {
  const resource = {
    title: 'Understanding Chart Patterns',
    description: "A comprehensive guide to recognizing and trading chart patterns. Learn to identify key formations like cup & handle, double bottoms, head & shoulders, flags, and more from Dan Zanger's chartpattern.com.",
    url: 'https://www.chartpattern.com/chart-patterns.cfm',
    color: '#74b9ff',
  };

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
            {resource.title}
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
            fontFamily: 'Inter, sans-serif',
          }}>
            Learn to read and interpret chart patterns for better trading decisions.
          </p>
        </div>

        {/* Card Link */}
        <a
          href={resource.url}
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
            e.currentTarget.style.borderColor = resource.color;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 24px ${resource.color}20`;
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
              Visit {resource.title}
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#787b86',
              lineHeight: '1.5',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
            }}>
              {resource.description}
            </p>
          </div>

          {/* External Link Icon */}
          <ExternalLink size={20} style={{ color: '#787b86', flexShrink: 0 }} />
        </a>
      </div>
    </div>
  );
}
