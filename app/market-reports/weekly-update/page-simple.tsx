/**
 * Refactored Weekly Market Update Page - COMPACT VERSION
 * Only 2 files needed + original types/constants file
 * 
 * Files:
 * 1. lib/market-report.ts (types + constants)
 * 2. components/market-report/compact.tsx (hooks + components)
 * 3. this file (main page)
 */

'use client';

import React from 'react';
import { COLORS } from '@/lib/market-report';
import {
  useWeeklyReport,
  SectionTitle, ChartTitle, Card, ErrorAlert, LoadingSpinner, Disclaimer,
  IndexPerformanceSection, SectorAnalyticsSection, StockPerformanceSection,
  TopMarketCapSection, BreakoutsSection, VolumeGainersSection,
} from '@/components/market-report/compact';

// Header Component
function PageHeader({ weekLabel, isGenerating, onGenerate }: any) {
  return (
    <div
      style={{
        backgroundColor: COLORS.headerBg,
        padding: '0 28px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${COLORS.sectionRed}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
          Saudi Weekly Market Update
        </div>
        {weekLabel && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{weekLabel}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>www.aporiaanalytics.com</span>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          style={{
            backgroundColor: COLORS.sectionRed,
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.65 : 1,
          }}
        >
          {isGenerating ? 'Generating…' : 'Generate Latest Week'}
        </button>
      </div>
    </div>
  );
}

// Main Page Component
export default function WeeklyMarketUpdatePage() {
  const { report, loading, error, isGenerating, generateReport } = useWeeklyReport();

  return (
    <div style={{ backgroundColor: COLORS.pageBg, minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: COLORS.tableText }}>
      <PageHeader weekLabel={report?.week_label} isGenerating={isGenerating} onGenerate={generateReport} />

      <div style={{ padding: '20px 24px 60px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          {loading && <LoadingSpinner />}
          {error && !loading && <ErrorAlert message={error} />}

          {report && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <IndexPerformanceSection data={report.index_performance} />
              <SectorAnalyticsSection data={report.sector_analytics} />
              <StockPerformanceSection data={report.stock_performance} />
              <TopMarketCapSection data={report.top_market_cap} />
              <BreakoutsSection data={report.breakouts} />
              <VolumeGainersSection data={report.volume_gainers} />
              <Disclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
