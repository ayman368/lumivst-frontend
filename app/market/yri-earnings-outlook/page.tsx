'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LayoutGrid, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// You can edit the titles here to match the 13 charts you have
const chartsData = [
  { id: 1, title: "S&P 500 EARNINGS FORECASTS: YRI VS ANALYSTS' CONSENSUS" },
  { id: 2, title: "YRI FORECASTS: S&P 500 REVENUES, EARNINGS & PROFIT MARGIN" },
  { id: 3, title: "S&P 500 FORWARD EARNINGS & REVENUES" },
  { id: 4, title: "S&P 500 EARNINGS YIELD VS TREASURY YIELD" },
  { id: 5, title: "S&P 500 PROFIT MARGIN ESTIMATES" },
  { id: 6, title: "S&P 500 OPERATING EARNINGS PER SHARE" },
  { id: 7, title: "S&P 500 REPORTED VS OPERATING EARNINGS" },
  { id: 8, title: "S&P 500 SECTOR EARNINGS GROWTH" },
  { id: 9, title: "GLOBAL EARNINGS ESTIMATES" },
  { id: 10, title: "U.S. VS REST OF WORLD EARNINGS" },
  { id: 11, title: "S&P 500 P/E VALUATION METRICS" },
  { id: 12, title: "S&P 500 EARNINGS SURPRISE HISTORY" },
  { id: 13, title: "S&P 500 REVENUE SURPRISE HISTORY" },
];

export default function YRIEarningsOutlookPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 px-6 md:px-12 w-full">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight mb-4">
                YRI Earnings Outlook
              </h1>
              <div className="inline-block bg-[#e2f0ea] border border-[#d2e6de] text-[#2c7a62] px-4 py-1.5 rounded-md font-semibold text-sm shadow-sm">
                13 Charts
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded text-sm shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 transition-colors font-medium border-r border-gray-200 ${
                  viewMode === 'grid' 
                    ? 'bg-[#317d69] text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid size={16} />
                Grid
              </button>
              <button 
                onClick={() => setViewMode('detail')}
                className={`flex items-center gap-2 px-4 py-2 transition-colors font-medium ${
                  viewMode === 'detail' 
                    ? 'bg-[#317d69] text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List size={18} />
                Detail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Space */}
      <div className="p-6 md:px-12 py-10">
        <div className="max-w-[1400px] mx-auto">
          
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 xl:grid-cols-2' 
              : 'grid-cols-1 max-w-5xl mx-auto'
          }`}>
            {chartsData.map((chart) => (
              <div 
                key={chart.id} 
                className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="p-5 md:p-6 pb-4 flex items-start gap-4 border-b border-gray-50">
                  <div className="bg-[#eaf4ef] border border-[#cae4d8] text-[#2c7a62] px-3 py-1 rounded text-sm font-semibold shrink-0">
                    Figure {chart.id}
                  </div>
                  <h2 className="text-[#1a2332] font-bold text-lg leading-tight pt-0.5 uppercase">
                    {chart.title}
                  </h2>
                </div>

                {/* Card Body - Image Placeholder */}
                <div 
                  className="flex-1 flex flex-col cursor-zoom-in"
                  onClick={() => setLightboxIndex(chart.id - 1)}
                >
                  <div className="relative w-full overflow-hidden">
                    <img 
                      src={`/yri-earnings/figure${chart.id}.png`}
                      alt={chart.title}
                      className="w-full h-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="p-12 text-center text-gray-500 font-medium w-full min-h-[300px] flex flex-col items-center justify-center border-t border-gray-100 bg-[#fcfcfc]"><p>Image Not Found</p><p class="text-xs text-gray-400 mt-2 font-mono">public/yri-earnings/figure${chart.id}.png</p></div>`;
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[40] bg-[#0a0a0a]/95 flex flex-col pt-24 pb-6 px-4 md:px-8 md:pt-32 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar (Title & Close Button) */}
          <div className="w-full flex items-start justify-between z-[101] shrink-0 mb-4 gap-4">
            {/* Title on the Left */}
            <div 
              className="bg-[#1f1f1f] px-4 py-2.5 md:px-6 md:py-3 text-white font-bold text-xs md:text-sm rounded border border-white/10 uppercase tracking-widest shadow-2xl shrink max-w-[85%]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-gray-500 mr-2 border-r border-gray-600 pr-2">Figure {chartsData[lightboxIndex].id}</span>
              {chartsData[lightboxIndex].title}
            </div>
            
            {/* Close Button on the Right */}
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
              className="bg-[#1f1f1f] hover:bg-[#333] text-gray-300 hover:text-white p-2.5 rounded border border-white/10 transition-colors shadow-2xl shrink-0"
              title="Close"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Image Container (Takes available space) */}
          <div 
            className="flex-1 relative w-full min-h-0 flex items-center justify-center z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
             <Image 
               src={`/yri-earnings/figure${chartsData[lightboxIndex].id}.png`}
               alt={chartsData[lightboxIndex].title}
               fill
               className="object-contain"
               priority
             />
          </div>

          {/* Bottom Bar: Prev / Next / Counter */}
          <div 
            className="w-full flex items-center justify-center z-[101] shrink-0 mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6 bg-[#1f1f1f] border border-white/10 px-4 py-2 rounded shadow-2xl text-white">
              <button 
                 className={`p-2 hover:bg-white/10 rounded transition-colors ${lightboxIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                 onClick={() => lightboxIndex > 0 && setLightboxIndex(lightboxIndex - 1)}
                 disabled={lightboxIndex === 0}
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              
              <span className="font-semibold text-sm tracking-widest min-w-[80px] text-center">
                 {lightboxIndex + 1} <span className="text-gray-500/50 mx-1">/</span> {chartsData.length}
              </span>
              
              <button 
                 className={`p-2 hover:bg-white/10 rounded transition-colors ${lightboxIndex === chartsData.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                 onClick={() => lightboxIndex < chartsData.length - 1 && setLightboxIndex(lightboxIndex + 1)}
                 disabled={lightboxIndex === chartsData.length - 1}
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
