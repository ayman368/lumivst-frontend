'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface StockResult {
  symbol: string;
  company_name: string;
  close: number;
  sma_50: number;
  sma_150: number;
  sma_200: number;
  rs_12m: number;
  percent_off_52w_high: number;
  percent_off_52w_low: number;
}

interface ScreenerTableProps {
  data: StockResult[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  screenerColor?: string;
}

export default function ScreenerTable({
  data,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  screenerColor = '#3B82F6',
}: ScreenerTableProps) {
  const totalPages = Math.ceil(total / limit);
  const startRecord = page * limit + 1;
  const endRecord = Math.min((page + 1) * limit, total);

  const formatNumber = (value: number | null | undefined, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2) + '%';
  };

  const exportToCSV = () => {
    const headers = [
      'رمز السهم',
      'اسم الشركة',
      'السعر الحالي',
      'SMA 50',
      'SMA 150',
      'SMA 200',
      'RS 12 شهر',
      'بعيد عن الأعلى 52 أسبوع',
      'بعيد عن الأدنى 52 أسبوع',
    ];

    const rows = data.map((stock) => [
      stock.symbol,
      stock.company_name,
      stock.close.toFixed(2),
      stock.sma_50.toFixed(2),
      stock.sma_150.toFixed(2),
      stock.sma_200.toFixed(2),
      stock.rs_12m.toFixed(2),
      (stock.percent_off_52w_high).toFixed(2) + '%',
      (stock.percent_off_52w_low).toFixed(2) + '%',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `screener-${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && data.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-700">
              <svg
                className="w-8 h-8 text-slate-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-slate-400">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-400 text-lg">
              لم يتم العثور على أسهم تطابق معايير البحث 📭
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            عرض {startRecord} إلى {endRecord} من {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-2 text-sm bg-slate-700 text-white border border-slate-600 rounded hover:border-slate-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <Button
            onClick={exportToCSV}
            className="gap-2 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Download className="w-4 h-4" />
            تنزيل
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-right text-slate-300 font-bold w-20">
                  #
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  رمز السهم
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  السعر
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  SMA 50
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  SMA 150
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  SMA 200
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  RS 12M
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  من الأعلى 52W
                </TableHead>
                <TableHead className="text-right text-slate-300 font-bold">
                  من الأدنى 52W
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((stock, index) => (
                <TableRow
                  key={stock.symbol}
                  className="border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <TableCell className="text-slate-400 font-medium text-right w-20">
                    {page * limit + index + 1}
                  </TableCell>
                  <TableCell
                    className="font-bold text-right"
                    style={{ color: screenerColor }}
                  >
                    {stock.symbol}
                  </TableCell>
                  <TableCell className="text-slate-300 text-right">
                    {stock.company_name}
                  </TableCell>
                  <TableCell className="text-slate-300 text-right font-medium">
                    {formatNumber(stock.close)}
                  </TableCell>
                  <TableCell className="text-slate-300 text-right">
                    {formatNumber(stock.sma_50)}
                  </TableCell>
                  <TableCell className="text-slate-300 text-right">
                    {formatNumber(stock.sma_150)}
                  </TableCell>
                  <TableCell className="text-slate-300 text-right">
                    {formatNumber(stock.sma_200)}
                  </TableCell>
                  <TableCell
                    className="text-right font-bold"
                    style={{
                      color: stock.rs_12m > 70 ? '#22c55e' : '#f59e0b',
                    }}
                  >
                    {formatNumber(stock.rs_12m)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    style={{
                      color:
                        stock.percent_off_52w_high > -15.0
                          ? '#ef4444'
                          : '#22c55e',
                    }}
                  >
                    {formatPercent(stock.percent_off_52w_high)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    style={{
                      color:
                        stock.percent_off_52w_low < 30.0
                          ? '#ef4444'
                          : '#22c55e',
                    }}
                  >
                    {formatPercent(stock.percent_off_52w_low)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          السابق
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            الصفحة {page + 1} من {totalPages}
          </span>
        </div>

        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="gap-2"
        >
          التالي
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
