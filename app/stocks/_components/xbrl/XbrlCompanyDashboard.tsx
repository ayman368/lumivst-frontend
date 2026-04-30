'use client'

import { useMemo, useState } from 'react'

import { useCompany, useKpis } from '@/hooks/useXbrlFinancials'
import type { EquityMatrixItem, PeriodMeta, SectionKey } from '@/types/xbrl-financials'
import { XbrlEquityTable } from './XbrlEquityTable'
import { XbrlFinancialChart } from './XbrlFinancialChart'
import { XbrlFinancialTable } from './XbrlFinancialTable'
import { XbrlKpiGrid } from './XbrlKpiCard'
import { XbrlSidebar } from './XbrlSidebar'
import { XbrlTopBar } from './XbrlTopBar'

export function XbrlCompanyDashboard({ symbol }: { symbol: string }) {
  const [section, setSection] = useState<SectionKey>('income_statement')
  const { data: company, loading: companyLoading, error } = useCompany(symbol)
  const { data: kpisData, loading: kpisLoading } = useKpis(symbol, section)

  const availableSections = useMemo(() => Object.keys(company?.sections ?? {}), [company?.sections])
  const currentSection = company?.sections?.[section]
  const isEquityMatrix = currentSection?.section_type === 'equity_matrix'

  return (
    <div className="min-h-screen bg-bg">
      <XbrlTopBar meta={company?.meta} />
      <div className="flex">
        <XbrlSidebar availableSections={availableSections} currentSection={section} onSelect={setSection} />
        <main className="flex-1 space-y-4 p-4">
          {error ? (
            <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : isEquityMatrix ? (
            /* Equity Changes — pivot table (rows=items, cols=components) */
            <XbrlEquityTable
              items={(currentSection?.items ?? []) as unknown as EquityMatrixItem[]}
              periods={currentSection?.periods ?? []}
              periodMeta={currentSection?.period_meta as PeriodMeta[]}
              components={currentSection?.components ?? []}
              loading={companyLoading}
            />
          ) : (
            /* Standard sections — KPIs + Chart + Table */
            <>
              <XbrlKpiGrid kpis={kpisData?.kpis} loading={kpisLoading} />
              <XbrlFinancialChart
                items={currentSection?.items ?? []}
                periods={currentSection?.periods ?? []}
                periodMeta={currentSection?.period_meta as PeriodMeta[]}
                sectionKey={section}
                loading={companyLoading}
              />
              <XbrlFinancialTable
                items={currentSection?.items ?? []}
                periods={currentSection?.periods ?? []}
                periodMeta={currentSection?.period_meta as PeriodMeta[]}
                sectionKey={section}
                loading={companyLoading}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
