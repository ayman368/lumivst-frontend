'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';

interface ScreenerFiltersProps {
  screenerType: string;
}

export default function ScreenerFilters({ screenerType }: ScreenerFiltersProps) {
  const filterConfigs = {
    'trend-1-month': {
      title: 'معايير الاتجاه - شهر واحد',
      criteria: [
        'SMA 50 > SMA 150: ✅',
        'SMA 50 > SMA 200: ✅',
        'SMA 150 > SMA 200: ✅',
        'SMA 200 > SMA 200 قبل شهر: ✅',
        'RS 12 شهر > 69: ✅',
        'بعيد عن الأدنى 52 أسبوع > 30%: ✅',
        'بعيد عن الأعلى 52 أسبوع > -25%: ✅',
      ],
    },
    'trend-2-months': {
      title: 'معايير الاتجاه - شهرين',
      criteria: [
        'SMA 50 > SMA 150: ✅',
        'SMA 50 > SMA 200: ✅',
        'SMA 150 > SMA 200: ✅',
        'SMA 200 > SMA 200 قبل شهرين: ✅',
        'RS 12 شهر > 69: ✅',
      ],
    },
    'trend-4-months': {
      title: 'معايير الاتجاه - 4 شهور',
      criteria: [
        'SMA 50 > SMA 150: ✅',
        'SMA 50 > SMA 200: ✅',
        'SMA 150 > SMA 200: ✅',
        'SMA 200 > SMA 200 قبل 4 شهور: ✅',
      ],
    },
    'power-play': {
      title: 'Power Play - أقوى المعايير',
      criteria: [
        'جميع معايير الاتجاه للـ 5 شهور',
        'RS 12 شهر > 69',
        'تحقق من جميع فترات المتوسطات المتحركة',
        'أقوى إشارة شراء في النظام',
      ],
    },
  };

  const config = filterConfigs[screenerType as keyof typeof filterConfigs];

  return (
    <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">{config?.title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config?.criteria.map((criterion, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-slate-700 rounded border border-slate-600"
          >
            <span className="text-green-400 font-bold">✓</span>
            <span className="text-slate-300">{criterion}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
