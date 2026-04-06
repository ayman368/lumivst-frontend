'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const tabs = [
  { label: 'Understanding Chart Patterns', href: '/learn/chart-patterns' },
  { label: "Dan's 10 Golden Rules", href: '/learn/golden-rules' },
  { label: 'Recommended Reading', href: '/learn/recommended-reading' },
  { label: 'Useful Stock Resources', href: '/learn/useful-stock-sources' },
];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Sub-navigation header */}
      <div style={{
        background: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        zIndex: 20,
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          overflowX: 'auto',
          gap: '0',
        }}>
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: '14px 20px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#D1D5DB' : 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  borderBottom: isActive ? '2px solid #D1D5DB' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  fontFamily: 'system-ui, sans-serif',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div>
        {children}
      </div>
    </div>
  );
}