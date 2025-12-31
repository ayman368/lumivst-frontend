'use client';

import React, { useState } from 'react';
import { PeersSubTabs } from '../../../_components/PeersSubTabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PEERS_DATA = [
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        sector: 'Information Technology',
        industry: 'Semiconductors',
        marketCap: '4.63T',
        enterpriseValue: '4.58T',
        employees: '36,000',
        saAnalysts: 44,
        wallStAnalysts: 64,
        color: '#ff6b00'
    },
    {
        symbol: 'AVGO',
        name: 'Broadcom Inc.',
        sector: 'Information Technology',
        industry: 'Semiconductors',
        marketCap: '1.67T',
        enterpriseValue: '1.72T',
        employees: '33,000',
        saAnalysts: 24,
        wallStAnalysts: 48,
        color: '#2196f3'
    },
    {
        symbol: 'TSM',
        name: 'Taiwan Semiconductor',
        sector: 'Information Technology',
        industry: 'Semiconductors',
        marketCap: '1.25T',
        enterpriseValue: '1.19T',
        employees: '83,825',
        saAnalysts: 14,
        wallStAnalysts: 17,
        color: '#e91e63'
    },
    {
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        sector: 'Information Technology',
        industry: 'Semiconductors',
        marketCap: '350.01B',
        enterpriseValue: '346.64B',
        employees: '28,000',
        saAnalysts: 14,
        wallStAnalysts: 51,
        color: '#4caf50'
    },
    {
        symbol: 'MU',
        name: 'Micron Technology',
        sector: 'Information Technology',
        industry: 'Semiconductors',
        marketCap: '320.53B',
        enterpriseValue: '321.01B',
        employees: '53,000',
        saAnalysts: 23,
        wallStAnalysts: 41,
        color: '#f44336'
    },
    {
        symbol: 'QCOM',
        name: 'QUALCOMM',
        sector: 'Information Technology',
        industry: 'Semiconductors',
        marketCap: '185.83B',
        enterpriseValue: '191.32B',
        employees: '52,000',
        saAnalysts: 11,
        wallStAnalysts: 36,
        color: '#673ab7'
    }
];

const TRADING_DATA = {
    lastClose: { NVDA: 190.53, AVGO: 352.13, TSM: 302.84, AMD: 214.99, MU: 284.79, QCOM: 174.81 },
    high52: { NVDA: 212.19, AVGO: 414.61, TSM: 313.98, AMD: 267.08, MU: 290.87, QCOM: 205.95 },
    low52: { NVDA: 86.62, AVGO: 138.10, TSM: 134.25, AMD: 76.48, MU: 61.54, QCOM: 120.80 },
    vsHigh: { NVDA: '-10.21%', AVGO: '-15.07%', TSM: '-3.55%', AMD: '-19.50%', MU: '-2.09%', QCOM: '-15.12%' },
    vsLow: { NVDA: '119.96%', AVGO: '154.98%', TSM: '125.58%', AMD: '181.11%', MU: '362.77%', QCOM: '44.71%' },
    volume: { NVDA: '0.69%', AVGO: '1.02%', TSM: '0.03%', AMD: '1.57%', MU: '2.67%', QCOM: '0.76%' }
};

const RETURNS_DATA = {
    m1: { NVDA: '5.70%', AVGO: '-11.26%', TSM: '4.71%', AMD: '0.35%', MU: '23.68%', QCOM: '6.40%' },
    m3: { NVDA: '6.93%', AVGO: '5.46%', TSM: '11.07%', AMD: '34.82%', MU: '81.20%', QCOM: '3.84%' },
    m6: { NVDA: '22.92%', AVGO: '30.81%', TSM: '35.97%', AMD: '49.63%', MU: '126.38%', QCOM: '11.70%' },
    m9: { NVDA: '67.51%', AVGO: '97.60%', TSM: '76.19%', AMD: '95.11%', MU: '210.01%', QCOM: '12.23%' },
    ytd: { NVDA: '41.92%', AVGO: '53.26%', TSM: '55.39%', AMD: '77.99%', MU: '239.36%', QCOM: '16.34%' }
};

const DIVIDENDS_DATA = {
    yieldFwd: { NVDA: '0.02%', AVGO: '0.74%', TSM: '1.28%', AMD: '-', MU: '0.16%', QCOM: '2.04%' },
    yieldTtm: { NVDA: '0.02%', AVGO: '0.69%', TSM: '1.11%', AMD: '-', MU: '0.16%', QCOM: '2.01%' },
    avgYield4y: { NVDA: '0.05%', AVGO: '1.89%', TSM: '1.65%', AMD: '-', MU: '0.52%', QCOM: '2.17%' },
    rateFwd: { NVDA: '$0.04', AVGO: '$2.60', TSM: '$3.87', AMD: '-', MU: '$0.46', QCOM: '$3.56' },
    rateTtm: { NVDA: '$0.04', AVGO: '$2.42', TSM: '$3.37', AMD: '-', MU: '$0.46', QCOM: '$3.52' }
};

const VALUATION_DATA = {
    peNonGaapFy1: { NVDA: 40.63, AVGO: 34.83, TSM: 29.10, AMD: 54.22, MU: 8.86, QCOM: 14.42 },
    peNonGaapFy2: { NVDA: 25.22, AVGO: 25.15, TSM: 23.80, AMD: 33.29, MU: 7.40, QCOM: 14.06 },
    peGaapFwd: { NVDA: 41.48, AVGO: 45.82, TSM: 29.20, AMD: 86.17, MU: 9.14, QCOM: 17.99 },
    pegNonGaap: { NVDA: 1.09, AVGO: 1.07, TSM: 1.33, AMD: 1.20, MU: 0.19, QCOM: 2.86 },
    priceSales: { NVDA: 34.85, AVGO: 25.07, TSM: 10.46, AMD: 10.80, MU: 7.54, QCOM: 4.33 }
};

const GROWTH_DATA = {
    revenueYoy: { NVDA: '152.83%', AVGO: '12.92%', TSM: '13.24%', AMD: '6.40%', MU: '-20.60%', QCOM: '-5.12%' },
    revenueFwd: { NVDA: '98.66%', AVGO: '16.73%', TSM: '22.56%', AMD: '13.12%', MU: '42.11%', QCOM: '5.20%' },
    ebitdaYoy: { NVDA: '345.21%', AVGO: '21.05%', TSM: '11.45%', AMD: '1.20%', MU: '-45.30%', QCOM: '-3.20%' },
    ebitdaFwd: { NVDA: '112.50%', AVGO: '24.11%', TSM: '19.80%', AMD: '22.45%', MU: '150.20%', QCOM: '8.50%' },
    epsYoy: { NVDA: '486.20%', AVGO: '15.20%', TSM: '9.80%', AMD: '-2.10%', MU: '-60.50%', QCOM: '-4.10%' },
    epsFwd: { NVDA: '105.40%', AVGO: '18.90%', TSM: '20.10%', AMD: '35.60%', MU: '250.80%', QCOM: '12.30%' }
};

const PROFITABILITY_DATA = {
    grossMargin: { NVDA: '75.29%', AVGO: '74.12%', TSM: '53.10%', AMD: '46.20%', MU: '22.30%', QCOM: '55.80%' },
    ebitMargin: { NVDA: '61.20%', AVGO: '45.30%', TSM: '42.50%', AMD: '4.10%', MU: '-10.50%', QCOM: '28.20%' },
    ebitdaMargin: { NVDA: '63.50%', AVGO: '52.10%', TSM: '68.20%', AMD: '18.50%', MU: '15.20%', QCOM: '32.10%' },
    netIncomeMargin: { NVDA: '51.30%', AVGO: '32.50%', TSM: '38.20%', AMD: '3.80%', MU: '-15.20%', QCOM: '22.50%' },
    roe: { NVDA: '115.20%', AVGO: '45.20%', TSM: '28.50%', AMD: '2.10%', MU: '-8.50%', QCOM: '35.20%' },
    roa: { NVDA: '45.20%', AVGO: '18.50%', TSM: '15.20%', AMD: '1.50%', MU: '-4.20%', QCOM: '18.50%' }
};

const OWNERSHIP_DATA = {
    institutional: { NVDA: '65.20%', AVGO: '82.10%', TSM: '18.50%', AMD: '72.50%', MU: '85.20%', QCOM: '75.20%' },
    insider: { NVDA: '4.20%', AVGO: '1.50%', TSM: '0.00%', AMD: '0.50%', MU: '0.20%', QCOM: '0.10%' },
    shortInterest: { NVDA: '1.20%', AVGO: '1.50%', TSM: '0.50%', AMD: '2.50%', MU: '3.20%', QCOM: '1.80%' }
};

const RISK_DATA = {
    shortInterest: { NVDA: '0.96%', AVGO: '1.19%', TSM: '-', AMD: '2.28%', MU: '2.03%', QCOM: '2.45%' },
    beta24m: { NVDA: '2.33', AVGO: '2.57', TSM: '1.10', AMD: '1.99', MU: '2.59', QCOM: '1.58' },
    beta60m: { NVDA: '2.28', AVGO: '1.20', TSM: '1.27', AMD: '1.93', MU: '1.55', QCOM: '1.21' },
    altmanZ: { NVDA: '55.38', AVGO: '8.81', TSM: '9.67', AMD: '8.84', MU: '5.18', QCOM: '6.27' }
};

const EPS_REVISIONS_DATA = {
    epsUp: { NVDA: '31', AVGO: '-', TSM: '5', AMD: '18', MU: '-', QCOM: '-' },
    epsDown: { NVDA: '2', AVGO: '-', TSM: '0', AMD: '13', MU: '-', QCOM: '-' },
    revUp: { NVDA: '49', AVGO: '-', TSM: '18', AMD: '31', MU: '22', QCOM: '-' },
    revDown: { NVDA: '0', AVGO: '-', TSM: '1', AMD: '0', MU: '0', QCOM: '-' }
};

const INCOME_STATEMENT_DATA = {
    revenue: { NVDA: '187.14B', AVGO: '63.89B', TSM: '119.14B', AMD: '32.03B', MU: '42.31B', QCOM: '44.28B' },
    revPerShare: { NVDA: '7.67', AVGO: '13.56', TSM: '4.60', AMD: '19.73', MU: '37.80', QCOM: '40.41' },
    epsDiluted: { NVDA: '4.04', AVGO: '4.77', TSM: '1.99', AMD: '2.02', MU: '10.54', QCOM: '5.01' },
    netIncome: { NVDA: '99.20B', AVGO: '23.13B', TSM: '51.57B', AMD: '3.31B', MU: '11.91B', QCOM: '5.54B' },
    grossProfit: { NVDA: '131.09B', AVGO: '49.40B', TSM: '70.26B', AMD: '16.48B', MU: '19.17B', QCOM: '24.55B' },
    ebitda: { NVDA: '112.70B', AVGO: '35.00B', TSM: '81.52B', AMD: '6.05B', MU: '22.23B', QCOM: '14.00B' },
    opIncome: { NVDA: '110.12B', AVGO: '26.37B', TSM: '59.01B', AMD: '3.05B', MU: '13.77B', QCOM: '12.39B' },
    netIncomeComm: { NVDA: '99.20B', AVGO: '23.13B', TSM: '51.57B', AMD: '3.13B', MU: '11.91B', QCOM: '5.54B' }
};

const BALANCE_SHEET_DATA = {
    totalCash: { NVDA: '60.61B', AVGO: '16.18B', TSM: '90.25B', AMD: '7.24B', MU: '10.32B', QCOM: '10.16B' },
    cashPerShare: { NVDA: '0.47', AVGO: '3.41', TSM: '3.13', AMD: '2.95', MU: '8.64', QCOM: '5.14' },
    totalDebt: { NVDA: '10.82B', AVGO: '66.46B', TSM: '33.76B', AMD: '3.87B', MU: '12.49B', QCOM: '15.64B' }
};

const CASH_FLOW_DATA = {
    opCashFlow: { NVDA: '83.16B', AVGO: '27.54B', TSM: '71.18B', AMD: '6.41B', MU: '22.69B', QCOM: '14.01B' },
    freeCashFlow: { NVDA: '53.28B', AVGO: '25.04B', TSM: '20.62B', AMD: '3.25B', MU: '444.25M', QCOM: '6.86B' },
    cashFromOps: { NVDA: '83.16B', AVGO: '27.54B', TSM: '71.18B', AMD: '6.41B', MU: '22.69B', QCOM: '14.01B' },
    capex: { NVDA: '-5.84B', AVGO: '-623.00M', TSM: '-41.91B', AMD: '-960.00M', MU: '-18.04B', QCOM: '-1.19B' }
};

// Mock chart data for 1Y
const CHART_DATA = Array.from({ length: 12 }, (_, i) => ({
    date: `2024-${i + 1}-01`,
    NVDA: 100 + Math.random() * 50,
    AVGO: 100 + Math.random() * 40,
    TSM: 100 + Math.random() * 30,
    AMD: 100 + Math.random() * 60,
    MU: 100 + Math.random() * 80,
    QCOM: 100 + Math.random() * 20,
}));

export default function PeersComparisonPage({ params }: { params: Promise<{ symbol: string }> }) {
    // Unwrapping params correctly for Next.js 15+
    const [resolvedParams, setResolvedParams] = useState<{ symbol: string } | null>(null);

    React.useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) return null;

    const { symbol } = resolvedParams;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <PeersSubTabs symbol={symbol} />

            <div className="px-6 max-w-[1400px] mx-auto">
                <div className="bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4">
                        <h1 className="text-2xl font-light text-gray-700">Similar to {symbol}</h1>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center min-w-[120px]">
                                        <div className="font-bold text-gray-900">{peer.symbol}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Company Info */}
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Company Name</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center text-blue-600">
                                        {peer.name}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Sector</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center text-blue-600">
                                        {peer.sector}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Industry</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center text-blue-600">
                                        {peer.industry}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Market Cap</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center font-medium">
                                        {peer.marketCap}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Enterprise Value</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center font-medium">
                                        {peer.enterpriseValue}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Employees</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center font-medium">
                                        {peer.employees}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">SA Analysts Covering</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center font-medium">
                                        {peer.saAnalysts}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">Wall St. Analysts</td>
                                {PEERS_DATA.map(peer => (
                                    <td key={peer.symbol} className="p-4 text-center font-medium">
                                        {peer.wallStAnalysts}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Chart Section */}
                <div className="mt-8 bg-white p-6 rounded shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-2">
                             <span className="text-gray-500">Metric:</span>
                             <select className="bg-gray-100 border-none rounded px-3 py-1 text-sm font-medium">
                                 <option>Price Return</option>
                             </select>
                         </div>
                         <div className="flex gap-2">
                             {['1D', '5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y'].map(range => (
                                 <button key={range} className={`px-3 py-1 text-xs font-bold rounded ${range === '1Y' ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                                     {range}
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                        {PEERS_DATA.map(peer => (
                            <div key={peer.symbol} className="flex items-center gap-2 p-3 border rounded min-w-[150px]">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: peer.color }}></div>
                                <div>
                                    <div className="font-bold text-sm" style={{ color: peer.color }}>{peer.symbol}</div>
                                    <div className="text-xs text-gray-500">Price Return</div>
                                </div>
                                <div className="ml-auto font-bold text-sm">
                                    {(Math.random() * 100).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={CHART_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} tickFormatter={val => `${val}%`} />
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                {PEERS_DATA.map(peer => (
                                    <Line 
                                        key={peer.symbol}
                                        type="monotone" 
                                        dataKey={peer.symbol} 
                                        stroke={peer.color} 
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Valuation Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Valuation</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'P/E Non-GAAP (FY1)', key: 'peNonGaapFy1' },
                                { label: 'P/E Non-GAAP (FY2)', key: 'peNonGaapFy2' },
                                { label: 'P/E GAAP (FWD)', key: 'peGaapFwd' },
                                { label: 'PEG Non-GAAP (FWD)', key: 'pegNonGaap' },
                                { label: 'Price/Sales (TTM)', key: 'priceSales' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {VALUATION_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Growth Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Growth</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Revenue Growth (YoY)', key: 'revenueYoy' },
                                { label: 'Revenue Growth (FWD)', key: 'revenueFwd' },
                                { label: 'EBITDA Growth (YoY)', key: 'ebitdaYoy' },
                                { label: 'EBITDA Growth (FWD)', key: 'ebitdaFwd' },
                                { label: 'EPS Growth (YoY)', key: 'epsYoy' },
                                { label: 'EPS Growth (FWD)', key: 'epsFwd' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {GROWTH_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Profitability Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Profitability</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Gross Profit Margin', key: 'grossMargin' },
                                { label: 'EBIT Margin', key: 'ebitMargin' },
                                { label: 'EBITDA Margin', key: 'ebitdaMargin' },
                                { label: 'Net Income Margin', key: 'netIncomeMargin' },
                                { label: 'Return on Equity', key: 'roe' },
                                { label: 'Return on Assets', key: 'roa' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {PROFITABILITY_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Ownership Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Ownership</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Institutional Ownership', key: 'institutional' },
                                { label: 'Insider Ownership', key: 'insider' },
                                { label: 'Short Interest', key: 'shortInterest' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {OWNERSHIP_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Risk Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Risk</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Short Interest', key: 'shortInterest' },
                                { label: '24M Beta', key: 'beta24m' },
                                { label: '60M Beta', key: 'beta60m' },
                                { label: 'Altman Z Score', key: 'altmanZ' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {RISK_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* EPS Revisions Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">EPS Revisions</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'EPS: FQ1 Up Revisions', key: 'epsUp' },
                                { label: 'EPS: FQ1 Down Revisions', key: 'epsDown' },
                                { label: 'Revenue: FQ1 Up Revisions', key: 'revUp' },
                                { label: 'Revenue: FQ1 Down Revisions', key: 'revDown' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {EPS_REVISIONS_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Income Statement Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Income Statement (TTM)</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Revenue', key: 'revenue' },
                                { label: 'Revenue Per Share', key: 'revPerShare' },
                                { label: 'EPS Diluted', key: 'epsDiluted' },
                                { label: 'Net Income', key: 'netIncome' },
                                { label: 'Gross Profit', key: 'grossProfit' },
                                { label: 'EBITDA', key: 'ebitda' },
                                { label: 'Operating Income', key: 'opIncome' },
                                { label: 'Net Income Avail. to Comm.', key: 'netIncomeComm' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {INCOME_STATEMENT_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Balance Sheet Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Balance Sheet (MRQ)</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Total Cash', key: 'totalCash' },
                                { label: 'Total Cash Per Share', key: 'cashPerShare' },
                                { label: 'Total Debt', key: 'totalDebt' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {BALANCE_SHEET_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cash Flow Statement Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Cash Flow Statement (TTM)</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Net Operating Cash Flow', key: 'opCashFlow' },
                                { label: 'Levered Free Cash Flow', key: 'freeCashFlow' },
                                { label: 'Cash from Operations', key: 'cashFromOps' },
                                { label: 'Capital Expenditures', key: 'capex' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {CASH_FLOW_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Return Section (Performance) */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Total Return</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: '1 Month Return', key: 'm1' },
                                { label: '3 Month Return', key: 'm3' },
                                { label: '6 Month Return', key: 'm6' },
                                { label: '9 Month Return', key: 'm9' },
                                { label: 'YTD Return', key: 'ytd' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {RETURNS_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Dividends Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Dividends</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Dividend Yield (FWD)', key: 'yieldFwd' },
                                { label: 'Dividend Yield (TTM)', key: 'yieldTtm' },
                                { label: '4 Year Average Yield', key: 'avgYield4y' },
                                { label: 'Dividend Rate (FWD)', key: 'rateFwd' },
                                { label: 'Dividend Rate (TTM)', key: 'rateTtm' },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {DIVIDENDS_DATA[row.key][peer.symbol]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Trading Section */}
                <div className="mt-8 bg-white rounded shadow-sm overflow-x-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-light text-gray-700">Trading</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 font-normal text-gray-500 min-w-[200px]"></th>
                                {PEERS_DATA.map(peer => (
                                    <th key={peer.symbol} className="p-4 text-center font-bold text-gray-900">{peer.symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Last Close', key: 'lastClose', format: (val: any) => `$${val}` },
                                { label: '52 Week High', key: 'high52', format: (val: any) => `$${val}` },
                                { label: '52 Week Low', key: 'low52', format: (val: any) => `$${val}` },
                                { label: 'Price vs. 52 Week High', key: 'vsHigh', format: (val: any) => val },
                                { label: 'Price vs. 52 Week Low', key: 'vsLow', format: (val: any) => val },
                                { label: 'Week Volume/Shares', key: 'volume', format: (val: any) => val },
                            ].map(row => (
                                <tr key={row.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{row.label}</td>
                                    {PEERS_DATA.map(peer => (
                                        <td key={peer.symbol} className="p-4 text-center font-medium">
                                            {/* @ts-ignore */}
                                            {row.format(TRADING_DATA[row.key][peer.symbol])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
