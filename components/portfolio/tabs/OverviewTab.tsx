'use client'

import { useState } from 'react'
import { calcSR } from '../../../utils/calculations'
import { formatSAR, formatPct } from '../../../utils/formatters'
import StatCard from '../shared/StatCard'
import { DocumentDuplicateIcon, InformationCircleIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { usePortfolioData, usePortfolioMutations } from '../../../hooks/usePortfolio'

const COLORS = ['#f0883e', '#3fb950', '#58a6ff', '#bc8cff', '#ff7b72', '#8b949e']

export default function OverviewTab() {
  const { positions, cash, performance, summary } = usePortfolioData()
  const { updateCash } = usePortfolioMutations()
  
  const [isEditingCash, setIsEditingCash] = useState(false)
  const [tempCash, setTempCash] = useState(cash.toString())
  const [returnType, setReturnType] = useState<'SR' | 'TWR'>('SR')
  const [moverTab, setMoverTab] = useState<'up' | 'down'>('up')
  const [divTab, setDivTab] = useState<'stocks' | 'sectors'>('stocks')

  // Use summary from backend if available, otherwise fallback to client-side calc
  const totalCost = summary?.total_cost ?? positions.reduce((acc: number, s: any) => acc + (s.qty * s.buy_price), 0)
  const stocksValue = summary?.stocks_value ?? positions.reduce((acc: number, s: any) => acc + (s.qty * (s.current_price || s.buy_price)), 0)
  const portfolioValue = summary?.total_value ?? (stocksValue + cash)
  
  const profitLossValue = summary?.unrealized_pnl ?? (stocksValue - totalCost)
  const profitLossPct = summary?.unrealized_pnl_pct ?? (totalCost > 0 ? (profitLossValue / totalCost) * 100 : 0)
  const realizedPnl = summary?.realized_pnl ?? 0

  const handleCashSave = () => {
    updateCash.mutate(Number(tempCash))
    setIsEditingCash(false)
  }

  // Calculate Diversification Data
  const stockData = positions.map((s: any) => ({
    name: s.name || s.symbol,
    value: s.qty * (s.current_price || s.buy_price)
  })).concat(cash > 0 ? [{ name: 'النقد المتاح', value: cash }] : [])

  const sectorsMap = positions.reduce((acc: any, s: any) => {
    const val = s.qty * (s.current_price || s.buy_price)
    const sector = s.sector || 'غير محدد'
    acc[sector] = (acc[sector] || 0) + val
    return acc
  }, {} as Record<string, number>)

  const sectorData = Object.keys(sectorsMap).map(k => ({
    name: k,
    value: sectorsMap[k]
  })).concat(cash > 0 ? [{ name: 'النقد المتاح', value: cash }] : [])

  // Calculate Top Movers (using change_percent from backend if available)
  const movers = positions.map((s: any) => ({
    name: s.name || s.symbol,
    change: s.change_percent ? (s.change_percent * 100) : 0
  }))

  const topMovers = movers.filter((m: any) => moverTab === 'up' ? m.change > 0 : m.change <= 0).sort((a: any, b: any) => moverTab === 'up' ? b.change - a.change : a.change - b.change)


  return (
    <div className="space-y-6 font-tajawal animate-in fade-in duration-300">
      
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard 
          title="إجمالي قيمة المحفظة"
          value={formatSAR(portfolioValue)}
          subtitle="قيمة الأسهم + النقد المتاح"
          icon={<DocumentDuplicateIcon />}
        />
        <StatCard 
          title="قيمة الأسهم"
          value={<span className={profitLossValue >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{formatSAR(stocksValue)}</span>}
          subtitle={<span className={profitLossValue >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{profitLossValue >= 0 ? '+' : ''}{formatSAR(profitLossValue)} ({profitLossPct.toFixed(2)}%)</span>}
          icon={<div />}
        />
        <StatCard 
          title="تكلفة الاستثمار"
          value={formatSAR(totalCost)}
          icon={<InformationCircleIcon />}
        />
        <StatCard 
          title="الربح المحقق"
          value={<span className={realizedPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{realizedPnl >= 0 ? '+' : ''}{formatSAR(realizedPnl)}</span>}
          subtitle="من الصفقات المغلقة"
          icon={<div />}
        />
        <StatCard 
          title="النقد المتاح"
          value={
            isEditingCash ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={tempCash}
                  onChange={e => setTempCash(e.target.value)}
                  className="w-24 text-lg bg-[var(--bg-surface)] border border-[var(--border)] rounded px-2 outline-none text-[var(--text-primary)]"
                />
                <button onClick={handleCashSave} className="text-[var(--green)] hover:text-[var(--green-light)]">
                  <CheckIcon className="w-5 h-5" />
                </button>
              </div>
            ) : formatSAR(cash)
          }
          icon={null}
          onEdit={() => setIsEditingCash(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">أداء المحفظة</h3>
              <InformationCircleIcon className="w-4 h-4 text-[var(--text-muted)] cursor-help" title="رسم بياني يوضح أداء المحفظة مقارنة بمؤشر تاسي" />
            </div>
            <div className="flex gap-2 relative">
              <div className="group relative">
                <button 
                  onClick={() => setReturnType('SR')}
                  className={`px-3 py-1 text-sm rounded-[4px] transition-colors ${returnType === 'SR' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}
                >
                  SR
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-[var(--border)] rounded-md shadow-lg p-3 text-xs text-[var(--text-primary)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-right">
                  <p className="font-bold mb-1">العائد البسيط (SR)</p>
                  <p>يقيس ربحك أو خسارتك كنسبة مئوية من إجمالي المبلغ المستثمر.</p>
                </div>
              </div>

              <div className="group relative">
                <button 
                  onClick={() => setReturnType('TWR')}
                  className={`px-3 py-1 text-sm rounded-[4px] transition-colors ${returnType === 'TWR' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}
                >
                  TWR
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-[var(--border)] rounded-md shadow-lg p-3 text-xs text-[var(--text-primary)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-right">
                  <p className="font-bold mb-1">العائد المُرجَّح بالزمن (TWR)</p>
                  <p>مقياس يُظهر الأداء الحقيقي للمحفظة بعزل أثر التدفقات النقدية (إيداعات/سحوبات).</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--green-light)]"></div>
              <span className="text-[var(--text-secondary)]">محفظتي</span>
              <span className="text-[var(--green)] font-medium">
                {performance && performance.length > 0 ? `${performance[performance.length-1][returnType === 'SR' ? 'sr' : 'twr']}%` : '0%'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--text-muted)]"></div>
              <span className="text-[var(--text-secondary)]">تاسي</span>
              <span className="text-[var(--text-muted)] font-medium">
                {performance && performance.length > 0 ? `${performance[performance.length-1].tasi}%` : '0%'}
              </span>
            </div>
          </div>

          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green-light)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--green-light)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12, fill: 'var(--text-muted)'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: 'var(--text-muted)'}} tickFormatter={val => `${val}%`} tickLine={false} axisLine={false} orientation="right" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey={returnType === 'SR' ? 'sr' : 'twr'} stroke="var(--green-light)" strokeWidth={2} fillOpacity={1} fill="url(#colorPf)" name="محفظتي" />
                <Area type="monotone" dataKey="tasi" stroke="var(--text-muted)" strokeWidth={2} fillOpacity={1} fill="url(#colorTasi)" name="تاسي" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          {/* Top Movers */}
          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] p-4 shadow-sm h-full max-h-[380px] overflow-y-auto">
            <div className="flex gap-4 border-b border-[var(--border)] mb-4">
              <button 
                onClick={() => setMoverTab('up')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${moverTab === 'up' ? 'border-[var(--green)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                ارتفاعاً
              </button>
              <button 
                onClick={() => setMoverTab('down')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${moverTab === 'down' ? 'border-[var(--red)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                انخفاضاً
              </button>
            </div>
            <div className="space-y-3">
              {topMovers.length > 0 ? topMovers.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-primary)]">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${m.change > 0 ? 'text-[var(--green)]' : m.change < 0 ? 'text-[var(--red)]' : 'text-[var(--text-muted)]'}`}>
                      {formatPct(m.change)}
                    </span>
                    <div className="w-16 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${m.change > 0 ? 'bg-[var(--green)]' : m.change < 0 ? 'bg-[var(--red)]' : 'bg-[var(--text-muted)]'}`}
                        style={{ width: `${Math.min(Math.abs(m.change) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-2">لا توجد بيانات</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diversification - Full Width Row */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] p-4 shadow-sm w-full h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">التنوع</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setDivTab('stocks')}
              className={`text-sm px-3 py-1 rounded transition-colors ${divTab === 'stocks' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border-b-2 border-transparent'}`}
            >
              الأسهم
            </button>
            <button 
              onClick={() => setDivTab('sectors')}
              className={`text-sm px-3 py-1 rounded transition-colors ${divTab === 'sectors' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border-b-2 border-transparent'}`}
            >
              القطاعات
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row items-center justify-between mt-4">
          <div className="w-full md:w-1/2 h-[350px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={divTab === 'stocks' ? stockData : sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={140}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {(divTab === 'stocks' ? stockData : sectorData).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => formatSAR(Number(value) || 0)}
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', direction: 'rtl' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-4 mt-6 md:mt-0">
            {(divTab === 'stocks' ? stockData : sectorData).map((item: any, index: number) => {
              const pct = portfolioValue > 0 ? (item.value / portfolioValue) * 100 : 0
              return (
                <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[var(--text-primary)] truncate font-medium">{item.name}</span>
                  </div>
                  <span className="text-[var(--text-secondary)] font-bold">{pct.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
