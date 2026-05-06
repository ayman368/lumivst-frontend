import React from 'react';
import { IndicatorMetadata } from '../_data/indicatorMetadata';

interface IndicatorFooterProps {
  metadata: IndicatorMetadata;
}

export default function IndicatorFooter({ metadata }: IndicatorFooterProps) {
  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-8 mt-8 rounded-b-lg">
      <div className="max-w-6xl">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Notes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">Source</div>
            <p className="text-sm">
              {metadata.sourceLink ? (
                <a 
                  href={metadata.sourceLink} 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {metadata.source}
                </a>
              ) : (
                <span className="text-gray-700">{metadata.source}</span>
              )}
            </p>
          </div>
          
          {metadata.releaseTitle && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Release</div>
              <p className="text-sm">
                {metadata.releaseLink ? (
                  <a 
                    href={metadata.releaseLink} 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {metadata.releaseTitle}
                  </a>
                ) : (
                  <span className="text-gray-700">{metadata.releaseTitle}</span>
                )}
              </p>
            </div>
          )}
          
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">Units</div>
            <p className="text-sm text-gray-700">{metadata.units}</p>
          </div>
          
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">Frequency</div>
            <p className="text-sm text-gray-700">{metadata.frequency}</p>
          </div>
        </div>
        
        {metadata.notes && (
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-3">Notes</div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{metadata.notes}</p>
          </div>
        )}
        
        {metadata.suggestedCitation && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3">Suggested Citation</div>
            <p className="text-sm text-gray-700 leading-relaxed font-mono bg-white p-3 border border-gray-300 rounded">
              {metadata.suggestedCitation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
