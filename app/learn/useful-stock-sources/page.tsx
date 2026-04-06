'use client';

import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const sources = [
  {
    title: 'US Earnings Calendar',
    description: 'Track upcoming earnings reports for US-listed companies. Stay ahead of market-moving announcements.',
    url: 'https://finance.yahoo.com/calendar/earnings',
  },
  {
    title: 'Economic Calendar',
    description: 'Monitor key economic events, indicators, and data releases that impact global markets.',
    url: 'https://finance.yahoo.com/calendar/economic',
  },
  {
    title: 'Initial Public Offerings',
    description: 'Discover upcoming IPOs, pricing details, and performance tracking for newly listed companies.',
    url: 'https://www.iposcoop.com/',
  },
];

export default function UsefulStockSourcesPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>

      {/* Hero Header */}
      <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#111827', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#D1D5DB', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>
                Resources • External Links
              </span>
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.02em', color: '#F9FAFB', marginBottom: '8px' }}>
              Useful <span style={{ color: '#D1D5DB' }}>Stock Sources</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', lineHeight: 1.6 }}>
              Curated collection of essential resources for stock market research and analysis.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '40px 32px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '20px' }}>
          {sources.map((source, index) => (
            <motion.a
              key={source.title}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '24px 28px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2962FF';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(41,98,255,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              {/* Left accent */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#2962FF', borderRadius: '0 2px 2px 0' }} />

              {/* Icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                backgroundColor: '#2962FF18', border: '1px solid #2962FF30',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ExternalLink size={18} style={{ color: '#2962FF' }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '4px', fontFamily: 'system-ui, sans-serif' }}>
                  {source.title}
                </h2>
                <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, fontFamily: 'system-ui, sans-serif', margin: 0 }}>
                  {source.description}
                </p>
              </div>

              {/* Arrow */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ExternalLink size={15} style={{ color: '#9CA3AF' }} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}