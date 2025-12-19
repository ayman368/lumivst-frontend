'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MoreHorizontal,
  Clock,
  TrendingUp,
  Newspaper,
  Zap,
  Briefcase
} from 'lucide-react';
import { StocksTopBar } from './stocks/_components/StocksTopBar';

// --- Mock Data ---

const MARKET_DATA = [
  { name: 'Dow Futures', value: '47,611.11', change: '136.65', pct: '+0.29%', isUp: true },
  { name: 'S&P Futures', value: '6,847.38', change: '18.01', pct: '+0.26%', isUp: true },
  { name: 'Nasdaq Futures', value: '25,624.31', change: '68.45', pct: '+0.27%', isUp: true },
  { name: 'Gold', value: '4,209.39', change: '3.25', pct: '+0.08%', isUp: true },
  { name: 'Silver', value: '58.46', change: '0.026', pct: '+0.04%', isUp: true },
  { name: 'Crude Oil', value: '59.44', change: '0.80', pct: '+1.36%', isUp: true },
];

const LATEST_NEWS_HEADLINES = [
  { time: '10:45 AM', title: 'Mortgage demand drops despite lower interest rates in key markets', source: 'Real Estate' },
  { time: '10:42 AM', title: "Macy's Non-GAAP EPS of $0.09 beats estimates by $0.22", source: 'Earnings' },
  { time: '10:30 AM', title: 'The Crypto Company plans to eliminate $4M convertible debt', source: 'Crypto' },
  { time: '10:15 AM', title: 'Dollar Tree gains after pointing to momentum across business units', source: 'Retail' },
  { time: '09:55 AM', title: 'National Bank of Canada raises dividend by 5.1%', source: 'Finance' },
];

const DAY_WATCH_DATA = {
  topGainers: [
    { symbol: 'EB', name: 'Eventbrite, Inc.', change: '78.63%', isUp: true, price: '8.45' },
    { symbol: 'MDB', name: 'MongoDB, Inc.', change: '22.23%', isUp: true, price: '286.12' },
    { symbol: 'GUTS', name: 'Fractyl Health, Inc.', change: '17.95%', isUp: true, price: '3.42' },
    { symbol: 'TMC', name: 'TMC the metals company', change: '17.74%', isUp: true, price: '1.24' },
  ],
  topLosers: [
    { symbol: 'JANX', name: 'Janux Therapeutics', change: '-53.34%', isUp: false, price: '12.45' },
    { symbol: 'ARMP', name: 'Armata Pharm', change: '-21.57%', isUp: false, price: '2.10' },
    { symbol: 'SYM', name: 'Symbotic Inc.', change: '-21.51%', isUp: false, price: '18.90' },
    { symbol: 'CNCK', name: 'Coincheck Group', change: '-18.78%', isUp: false, price: '5.67' },
  ],
  tech5: [
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', change: '0.23%', isUp: true, price: '182.40' },
    { symbol: 'AAPL', name: 'Apple Inc.', change: '1.09%', isUp: true, price: '224.55' },
    { symbol: 'GOOG', name: 'Alphabet Inc.', change: '0.29%', isUp: true, price: '174.12' },
    { symbol: 'MSFT', name: 'Microsoft Corp', change: '0.67%', isUp: true, price: '416.22' },
  ],
  mostActive: [
    { symbol: 'NVDA', name: 'NVIDIA Corp', change: '0.86%', isUp: true, price: '142.50' },
    { symbol: 'AMD', name: 'Adv Micro Devices', change: '-2.06%', isUp: false, price: '168.30' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', change: '1.45%', isUp: true, price: '245.60' },
    { symbol: 'PLTR', name: 'Palantir Tech', change: '3.12%', isUp: true, price: '26.80' },
  ],
};

const TRENDING_ANALYSIS = [
  { author: 'J. Anderson', title: 'Betting Big On This Near-Perfect 8%-Yielding Income Machine', tag: 'Income Strategy' },
  { author: 'Income Investor', title: 'Retiring On Dividends: SCHD Vs. Covered Call ETFs', tag: 'Retirement' },
  { author: 'Tech Analyst', title: 'Nvidia Stock: The Market Is Missing A Huge 2026 ARR Surge', tag: 'Growth' },
  { author: 'Value Hunter', title: "PayPal's Shift Is Accelerating: Buy The Dip", tag: 'Long Idea' },
  { author: 'Macro View', title: 'The Fed Pivot Is Here: What It Means For Bond Yields', tag: 'Macro' },
];

const TRENDING_NEWS = [
  { id: 1, title: "Elon Musk's Boring Company ramps up plans in Las Vegas and Nashville" },
  { id: 2, title: "CrowdStrike in charts: Subscription revenue +21%, ARR grew 23%" },
  { id: 3, title: "Stock index futures advance after prior session's bounce" },
  { id: 4, title: "Enbridge raises dividend by 3% to CAD 0.97" },
  { id: 5, title: "MongoDB's Atlas gains traction as analysts identify it as possible key player" },
];

const UNDERCOVERED_STOCKS = [
  { symbol: 'NESN', title: "Nestlé: New CEO's Strategic Pivot Strengthens The Buy Case" },
  { symbol: 'AMLP', title: "Alerian MLP ETF: High Yield And K-1 Avoidance Costs" },
  { symbol: 'JAAA', title: "JAAA: Deciphering The Management Commentary" },
  { symbol: 'DEA', title: "Easterly Government Properties: Get Paid An 8% Yield" },
];

const DIVIDEND_PICKS = [
  { symbol: 'O', title: "Building An Income Portfolio? Start With Realty Income" },
  { symbol: 'MAIN', title: "The King of BDCs: Why Main Street Capital Wins" },
  { symbol: 'VICI', title: "VICI Properties: A safe bet in an unsafe market" },
  { symbol: 'SCHD', title: "The ultimate dividend growth ETF for 2025" },
];

const EARNINGS_DATA = {
  col1: [
    { symbol: 'TOL', name: 'Toll Brothers', mCap: '13.39B', date: 'Post: 12/08', est: '2.45' },
    { symbol: 'OLLI', name: "Ollie's Outlet", mCap: '7.44B', date: 'Pre: 12/09', est: '0.98' },
    { symbol: 'CPB', name: "Campbell's", mCap: '8.81B', date: 'Pre: 12/09', est: '1.02' },
    { symbol: 'GME', name: 'GameStop', mCap: '10.3B', date: 'Post: 12/09', est: '-0.02' },
  ],
  col2: [
    { symbol: 'ADB', name: 'Adobe Inc.', mCap: '144.9B', date: 'Post: 12/10', est: '4.50' },
    { symbol: 'ORCL', name: 'Oracle Corp', mCap: '620.2B', date: 'Post: 12/10', est: '1.45' },
    { symbol: 'CHWY', name: 'Chewy, Inc.', mCap: '13.8B', date: 'Pre: 12/10', est: '0.22' },
    { symbol: 'LULU', name: 'Lululemon', mCap: '22.5B', date: 'Post: 12/11', est: '2.68' },
  ]
};

export default function HomePage() {
  const router = useRouter();
  const [chartRange, setChartRange] = useState('1D');

  const renderWatchTable = (title: string, data: typeof DAY_WATCH_DATA.topGainers) => (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
      </div>
      <div className="divide-y divide-slate-100">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer group">
            <div className="flex flex-col">
              <span className="font-bold text-blue-700 text-sm group-hover:underline">{item.symbol}</span>
              <span className="text-slate-500 text-xs">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-800 text-sm">{item.price}</div>
              <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${item.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                {item.change}
                {item.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans text-sm pb-16">

      <StocksTopBar />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-4 mt-6">

        {/* Main Dashboard Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Main Section (Indices + Chart) */}
          <div className="lg:col-span-9 bg-white border border-gray-200 rounded-sm shadow-sm">

            {/* Controls Header */}
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
              <div className="flex bg-transparent items-center text-sm font-medium text-gray-500 overflow-x-auto no-scrollbar">
                {['US', 'World', 'Commodities', 'Futures', 'Treasuries'].map((tab, i, arr) => (
                  <div key={tab} className="flex items-center shrink-0">
                    <button className={`relative pb-1 hover:text-gray-900 transition-colors ${i === 0 ? 'text-gray-900 font-bold' : ''}`}>
                      {tab}
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 rounded-t-sm"></span>
                      )}
                    </button>
                    {i < arr.length - 1 && <span className="mx-3 text-gray-300 text-xs">|</span>}
                  </div>
                ))}
              </div>
              <div className="flex bg-slate-50 p-1 rounded-md overflow-x-auto">
                {['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', '10Y', 'MAX'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-[3px] transition-all whitespace-nowrap ${chartRange === r
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Content: Indices list & Chart */}
            <div className="grid grid-cols-12 min-h-[350px]">
              {/* Indices List */}
              <div className="col-span-12 lg:col-span-5 border-r border-gray-100 p-0">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    {MARKET_DATA.map((item, i) => (
                      <tr key={i} className={`group cursor-pointer hover:bg-gray-50 transition-colors ${i === 0 ? 'bg-white' : ''} ${i === 0 ? 'border-l-[4px] border-l-orange-500' : 'border-l-[4px] border-l-transparent'}`}>
                        <td className="py-3 pl-3 pr-2 font-bold text-blue-600 truncate max-w-[100px]">{item.name}</td>
                        <td className="py-3 px-2 text-right font-bold text-gray-900 whitespace-nowrap">{item.value}</td>
                        <td className={`py-3 px-2 text-right font-medium whitespace-nowrap ${item.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                          {item.change}
                        </td>
                        <td className={`py-3 pl-2 pr-4 text-right font-medium whitespace-nowrap ${item.pct.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                          {item.pct}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chart Area */}
              <div className="col-span-12 lg:col-span-7 bg-white relative">
                <div className="h-full w-full p-4 relative">
                  {/* SVG Chart */}
                  <svg className="w-full h-full text-slate-300" preserveAspectRatio="none" viewBox="0 0 600 300">
                    {/* Grid Lines Horizontal Only */}
                    <line x1="0" y1="0" x2="600" y2="0" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                    <line x1="0" y1="225" x2="600" y2="225" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                    <line x1="0" y1="300" x2="600" y2="300" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />

                    <defs>
                      <linearGradient id="chartIndGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,300 L0,150 C50,140 100,160 150,130 C200,100 250,110 300,90 C350,70 400,150 450,180 C500,200 550,220 600,240 L600,300 Z" fill="url(#chartIndGradient)" />
                    <path d="M0,150 C50,140 100,160 150,130 C200,100 250,110 300,90 C350,70 400,150 450,180 C500,200 550,220 600,240" fill="none" stroke="#f97316" strokeWidth="2" />
                  </svg>

                  {/* Right Axis Labels */}
                  <div className="absolute right-2 top-4 flex flex-col justify-between h-[80%] text-[10px] text-gray-400 font-mono text-right pointer-events-none">
                    <div>48,000</div>
                    <div>47,800</div>
                    <div>47,600</div>
                    <div>47,400</div>
                  </div>

                  {/* Bottom Axis Labels */}
                  <div className="absolute bottom-2 left-0 w-full flex justify-around text-[10px] text-gray-400 font-sans px-8">
                    <span>10 AM</span>
                    <span>12 PM</span>
                    <span>2 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Latest News */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-sm shadow-sm h-fit">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-sm">Latest News</h3>
              <Link href="/news" className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center gap-1">See All News <span className="text-[9px]">»</span></Link>
            </div>
            <div className="divide-y divide-gray-100">
              {LATEST_NEWS_HEADLINES.map((news, i) => (
                <div key={i} className="p-3 hover:bg-blue-50/20 cursor-pointer group flex gap-3 items-start">
                  <div className="text-[11px] text-gray-500 font-mono pt-0.5 whitespace-nowrap min-w-[24px]">
                    {i === 0 ? <span className="text-orange-600 font-bold">New!</span> : `${(i * 3) + 1}m`}
                  </div>
                  <h4 className="text-[13px] font-medium text-blue-600 leading-snug group-hover:underline">
                    {news.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- Day Watch Grid --- */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-700 pl-3">Day Watch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderWatchTable('Top Gainers', DAY_WATCH_DATA.topGainers)}
            {renderWatchTable('Top Losers', DAY_WATCH_DATA.topLosers)}
            {renderWatchTable('Tech Giants', DAY_WATCH_DATA.tech5)}
            {renderWatchTable('Most Active', DAY_WATCH_DATA.mostActive)}
          </div>
        </div>

        {/* --- Main Analysis & News Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: In-Depth Analysis */}
          <div className="lg:col-span-8 space-y-8">

            {/* Trending Analysis */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  Trending Analysis
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {TRENDING_ANALYSIS.map((item, i) => (
                  <div key={i} className="p-6 hover:bg-slate-50 group cursor-pointer flex gap-4">
                    <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 bg-slate-100 text-slate-500 font-serif font-bold rounded">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{item.tag}</span>
                        <span className="text-slate-400 text-xs">by <span className="text-slate-600 font-medium">{item.author}</span></span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Undercovered Section */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-6">
              <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Undercovered Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UNDERCOVERED_STOCKS.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-700">{item.symbol}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-snug">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Dividend & Lists */}
          <div className="lg:col-span-4 space-y-8">

            {/* Trending News List */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Trending News</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {TRENDING_NEWS.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 cursor-pointer flex gap-3">
                    <span className="font-mono text-slate-300 font-bold text-lg">0{item.id}</span>
                    <h3 className="text-sm font-medium text-slate-900 hover:text-blue-700 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Dividend Picks - Professional Card */}
            <div className="bg-white border border-blue-100 rounded-lg shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Dividend Quick Picks
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {DIVIDEND_PICKS.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-blue-50/30 cursor-pointer">
                    <span className="text-xs font-bold text-blue-700 block mb-1">{item.symbol}</span>
                    <h3 className="text-sm font-medium text-slate-800 hover:text-blue-800 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link href="/dividends" className="text-xs font-bold text-blue-700 hover:underline">View All Dividend Strategies</Link>
              </div>
            </div>

          </div>

        </div>

        {/* --- Earnings Calendar --- */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-8 py-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                Earnings Calendar
              </h2>
              <p className="text-slate-500 text-sm mt-1">Key upcoming reports for the week</p>
            </div>
            <Link href="/earnings" className="text-sm font-semibold text-blue-700 border border-blue-200 px-4 py-2 rounded hover:bg-blue-50 transition-colors text-center">
              View Full Calendar
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {[EARNINGS_DATA.col1, EARNINGS_DATA.col2].map((col, idx) => (
              <div key={idx} className={`p-0 ${idx === 0 ? 'md:border-r border-slate-200' : ''}`}>
                <div className="flex justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <span>Company</span>
                  <span className="flex gap-8 px-4">
                    <span className="w-16 text-right">M. Cap</span>
                    <span className="w-16 text-right">Est. EPS</span>
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {col.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200">
                          {item.symbol[0]}
                        </div>
                        <div>
                          <span className="block font-bold text-blue-700 text-sm group-hover:underline">{item.symbol}</span>
                          <span className="block text-slate-500 text-xs">{item.name}</span>
                        </div>
                      </div>

                      <div className="flex gap-8 items-center text-sm">
                        <span className="w-16 text-right font-mono text-slate-600 text-xs">{item.mCap}</span>
                        <span className={`w-16 text-right font-mono text-xs font-bold ${Number(item.est) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {item.est}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div >
  );
}
