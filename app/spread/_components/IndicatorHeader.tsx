import React from 'react';
import { SpreadMetadata } from '../_data/spreadMetadata';

interface IndicatorHeaderProps {
  metadata: SpreadMetadata;
}

export default function IndicatorHeader({ metadata }: IndicatorHeaderProps) {
  // Format observation date based on frequency
  const formatObservationDate = (dateStr: string | undefined, freq: string | undefined) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00Z');
      if (freq && freq.toLowerCase().includes('monthly')) {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      return dateStr; // Fallback to YYYY-MM-DD for weekly/daily or others
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-6 mb-8 rounded-t-lg">
      <div className="max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{metadata.title} ({metadata.code})</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
          {metadata.observations && (
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Observations</div>
              <div className="text-lg font-bold text-gray-900">
                {metadata.observationDate ? `${formatObservationDate(metadata.observationDate, metadata.frequency)}: ` : ''}
                {metadata.observations}
              </div>
            </div>
          )}
          
          {metadata.updated && (
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Updated</div>
              <div className="text-sm text-gray-800">{metadata.updated}</div>
            </div>
          )}
          
          {metadata.nextRelease && (
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Next Release Date</div>
              <div className="text-sm text-gray-800">{metadata.nextRelease}</div>
            </div>
          )}
          
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Units</div>
            <div className="text-sm text-gray-800">{metadata.units}</div>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Frequency</div>
            <div className="text-sm text-gray-800">{metadata.frequency}</div>
          </div>
          
          {metadata.dateRange && (
            <div className="col-span-2 md:col-span-1">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Date Range</div>
              <div className="text-sm text-gray-800">{metadata.dateRange}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
