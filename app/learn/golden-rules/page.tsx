'use client';

import { ExternalLink } from 'lucide-react';

export default function GoldenRulesPage() {
  const resource = {
    title: "Dan's 10 Golden Rules",
    description: "Dan Zanger's essential 10 golden rules for successful trading. These time-tested principles cover risk management, position sizing, and the discipline needed to consistently profit in the stock market.",
    url: 'https://www.chartpattern.com/golden-rules.cfm',
    color: '#fdcb6e',
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
            Master the fundamentals of successful trading with Dan Zanger&apos;s proven rules.
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
