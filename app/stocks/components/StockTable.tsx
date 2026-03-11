import React from 'react';
import Link from 'next/link';
import RatingBadge from './RatingBadge';
import type { Stock } from '../types';
import {
    cleanSymbol,
    parseFormattedNumber,
    formatNumber,
    formatNumberOneDecimal,
    formatChange,
    formatChangePercent,
    formatChangePercentOneDecimal,
    formatText,
    displayRawValue
} from '../utils/formatters';

type ColumnDef = { key: string; label: string; visibleKey: string };

export default function StockTable({
    stocks,
    columnDefinitions,
    visibleColumns,
    sortConfigs,
    handleSort
}: {
    stocks: Stock[];
    columnDefinitions: ColumnDef[];
    visibleColumns: Record<string, boolean>;
    sortConfigs: Array<{ key: string; direction: 'asc' | 'desc' }>;
    handleSort: (key: string) => void;
}) {
    return (
        <div className="flex-1 overflow-auto border-t border-gray-200 bg-white">
            <table className="min-w-full bg-white text-[10px] border-separate border-spacing-0">
                <thead className="bg-gray-50 sticky top-0 z-40 shadow-sm">
                    <tr>
                        {columnDefinitions
                            .filter(col => visibleColumns[col.visibleKey])
                            .map((col) => {
                                const sortIndex = sortConfigs.findIndex(c => c.key === col.key);
                                const isSorted = sortIndex !== -1;
                                const sortPriority = sortIndex + 1;
                                const sortDir = isSorted ? sortConfigs[sortIndex].direction : null;

                                let stickyClass = '';

                                if (col.key === 'symbol') {
                                    stickyClass = 'sticky left-0 z-50 bg-gray-50 border-r border-gray-200 min-w-[70px] w-[70px] max-w-[70px]';
                                } else if (col.key === 'name') {
                                    stickyClass = 'sticky z-50 bg-gray-50 border-r border-gray-200 min-w-[180px] w-[180px] max-w-[180px]';
                                    if (visibleColumns['symbol']) {
                                        stickyClass += ' left-[70px]';
                                    } else {
                                        stickyClass += ' left-0';
                                    }
                                }

                                return (
                                    <th
                                        key={col.key}
                                        className={`
                                            px-1 py-1 text-center text-[12px] font-sans font-bold text-gray-900 border-b border-gray-200 cursor-pointer 
                                            hover:bg-gray-100 transition-colors whitespace-nowrap overflow-hidden text-ellipsis
                                            ${stickyClass}
                                            ${isSorted ? 'bg-blue-50 text-blue-900 border-b-2 border-b-blue-500' : ''}
                                        `}
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <div className="flex items-center justify-center space-x-1">
                                            <span className="font-semibold">{col.label}</span>
                                            <div className="flex flex-col">
                                                {isSorted ? (
                                                    <span className="text-xs font-bold">
                                                        {sortDir === 'asc' ? '▲' : '▼'}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 opacity-50 block leading-[8px]">
                                                        ▲<br />▼
                                                    </span>
                                                )}
                                            </div>
                                            {isSorted && (
                                                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                                                    {sortPriority}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })
                        }
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stocks.map((stock) => {
                        const cleanSym = cleanSymbol(stock.symbol);
                        const changeNum = parseFormattedNumber(stock.change, true);
                        const changePercentNum = parseFormattedNumber(stock.percent_change);
                        const isChangeNegative = changeNum < 0;
                        const isPercentNegative = changePercentNum < 0;

                        return (
                            <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors group">
                                {columnDefinitions
                                    .filter(col => visibleColumns[col.visibleKey])
                                    .map((col) => {
                                        let content: any;
                                        let stickyClass = '';

                                        if (col.key === 'symbol') {
                                            stickyClass = 'sticky left-0 z-30 bg-white group-hover:bg-gray-50 border-r border-gray-100 min-w-[70px] w-[70px] max-w-[70px]';
                                        } else if (col.key === 'name') {
                                            stickyClass = 'sticky z-30 bg-white group-hover:bg-gray-50 border-r border-gray-100 min-w-[180px] w-[180px] max-w-[180px]';
                                            if (visibleColumns['symbol']) {
                                                stickyClass += ' left-[70px]';
                                            } else {
                                                stickyClass += ' left-0';
                                            }
                                        }

                                        switch (col.key) {
                                            case 'symbol':
                                                content = (
                                                    <Link
                                                        href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`}
                                                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline block truncate"
                                                    >
                                                        {cleanSym}
                                                    </Link>
                                                );
                                                break;

                                            case 'name':
                                                content = (
                                                    <Link
                                                        href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`}
                                                        className="text-gray-900 font-medium hover:text-blue-600 block truncate"
                                                        title={stock.name}
                                                    >
                                                        {stock.name}
                                                    </Link>
                                                );
                                                break;

                                            case 'charts':
                                                content = (
                                                    <button className="text-gray-400 hover:text-blue-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                    </button>
                                                );
                                                break;

                                            case 'rs_rating':
                                                content = (
                                                    <span className={`font-bold ${(stock.rs_rating || 0) >= 80 ? 'text-green-600' : (stock.rs_rating || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                        {stock.rs_rating || '-'}
                                                    </span>
                                                );
                                                break;

                                            case 'acc_dis_rating':
                                                content = <RatingBadge value={stock.acc_dis_rating} />;
                                                break;

                                            case 'industry_group_rs':
                                                content = <RatingBadge value={stock.industry_group_rs} />;
                                                break;

                                            case 'sector_rs':
                                                content = <RatingBadge value={stock.sector_rs} />;
                                                break;

                                            case 'industry_rs':
                                                content = <RatingBadge value={stock.industry_rs} />;
                                                break;

                                            case 'sub_industry_rs':
                                                content = <RatingBadge value={stock.sub_industry_rs} />;
                                                break;

                                            case 'price':
                                                content = <span className="font-medium">{formatNumber(stock.price)}</span>;
                                                break;

                                            case 'change':
                                                content = <span className={isChangeNegative ? 'text-red-600' : 'text-green-600'}>{formatChange(stock.change)}</span>;
                                                break;

                                            case 'percent_change':
                                                content = <span className={isPercentNegative ? 'text-red-600' : 'text-green-600'}>{formatChangePercent(stock.percent_change)}</span>;
                                                break;

                                            case 'volume':
                                                content = <span>{formatNumber(stock.volume)}</span>;
                                                break;

                                            case 'turnover':
                                                content = <span className="text-gray-900">{formatNumber(stock.turnover)}</span>;
                                                break;

                                            case 'no_of_trades':
                                                content = <span className="text-gray-900">{displayRawValue(stock.no_of_trades)}</span>;
                                                break;

                                            case 'market_cap':
                                                content = <span className="text-gray-900">{displayRawValue(stock.market_cap)}</span>;
                                                break;

                                            case 'industry_group':
                                                content = <span className="text-gray-900">{formatText(stock.industry_group)}</span>;
                                                break;

                                            case 'sector':
                                                content = <span className="text-gray-900">{formatText(stock.sector)}</span>;
                                                break;

                                            case 'industry':
                                                content = <span className="text-gray-900">{formatText(stock.industry)}</span>;
                                                break;

                                            case 'sub_industry':
                                                content = <span className="text-gray-900">{formatText(stock.sub_industry)}</span>;
                                                break;

                                            case 'open':
                                                content = <span className="text-gray-900">{formatNumber(stock.open)}</span>;
                                                break;

                                            case 'high':
                                                content = <span className="text-gray-900">{formatNumber(stock.high)}</span>;
                                                break;

                                            case 'low':
                                                content = <span className="text-gray-900">{formatNumber(stock.low)}</span>;
                                                break;

                                            case 'price_minus_sma_10':
                                                content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_10)}</span>;
                                                break;

                                            case 'price_minus_sma_21':
                                                content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_21)}</span>;
                                                break;

                                            case 'price_minus_sma_50':
                                                content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_50)}</span>;
                                                break;

                                            case 'price_minus_sma_150':
                                                content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_150)}</span>;
                                                break;

                                            case 'price_minus_sma_200':
                                                content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_200)}</span>;
                                                break;

                                            case 'fifty_two_week_high_price':
                                                content = <span className="text-gray-900">{formatNumber(stock.fifty_two_week_high_price)}</span>;
                                                break;

                                            case 'fifty_two_week_low_price':
                                                content = <span className="text-gray-900">{formatNumber(stock.fifty_two_week_low_price)}</span>;
                                                break;

                                            case 'average_volume_50':
                                                content = <span className="text-gray-900">{formatNumber(stock.average_volume_50)}</span>;
                                                break;

                                            case 'price_vs_sma_10_percent':
                                                content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_10_percent)}</span>;
                                                break;

                                            case 'price_vs_sma_21_percent':
                                                content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_21_percent)}</span>;
                                                break;

                                            case 'price_vs_sma_50_percent':
                                                content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_50_percent)}</span>;
                                                break;

                                            case 'price_vs_sma_150_percent':
                                                content = <span className="text-gray-900">{formatChangePercentOneDecimal(stock.price_vs_sma_150_percent)}</span>;
                                                break;

                                            case 'price_vs_sma_200_percent':
                                                content = <span className="text-gray-900">{formatChangePercentOneDecimal(stock.price_vs_sma_200_percent)}</span>;
                                                break;

                                            case 'percent_off_52w_high':
                                                content = <span className={(stock.percent_off_52w_high || 0) < 0 ? 'text-red-600' : 'text-gray-900'}>{formatChangePercentOneDecimal(stock.percent_off_52w_high)}</span>;
                                                break;

                                            case 'percent_off_52w_low':
                                                content = <span className="text-gray-900">{formatChangePercentOneDecimal(stock.percent_off_52w_low)}</span>;
                                                break;

                                            case 'vol_diff_50_percent':
                                                content = <span className="text-gray-900">{formatChangePercentOneDecimal(stock.vol_diff_50_percent)}</span>;
                                                break;

                                            default: {
                                                const val = stock[col.key as keyof Stock];
                                                if (val === undefined || val === null || val === '') {
                                                    content = <span>-</span>;
                                                } else if (typeof val === 'number' || !isNaN(parseFloat(String(val).replace(/,/g, '').replace(/%/g, '')))) {
                                                    const oneDecimalKeys = new Set([
                                                        'sma9_close', 'the_number', 'the_number_hl', 'the_number_ll',
                                                        'sma_4', 'sma_9', 'sma_18', 'wma45_close',
                                                        'sma9_close_w', 'the_number_w', 'the_number_hl_w', 'the_number_ll_w',
                                                        'sma_4w', 'sma_9w', 'sma_18w', 'wma45_close_w',
                                                    ]);
                                                    content = (
                                                        <span className="text-gray-900">
                                                            {oneDecimalKeys.has(col.key) ? formatNumberOneDecimal(val) : formatNumber(val)}
                                                        </span>
                                                    );
                                                } else {
                                                    content = <span className="text-gray-900">{formatText(val)}</span>;
                                                }
                                            }
                                        }

                                        return (
                                            <td key={col.key} className={`px-1 py-0.5 text-center ${stickyClass}`}>
                                                {content}
                                            </td>
                                        );
                                    })
                                }
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
