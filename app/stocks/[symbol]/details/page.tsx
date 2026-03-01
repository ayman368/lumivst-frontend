'use client';

import { useParams } from 'next/navigation';
import XBRLDataViewerEnhanced from '../../_components/XBRLDataViewerEnhanced';

export default function DetailsPage() {
    const params = useParams();
    const symbol = params.symbol as string;

    return (
        <div className="flex-1 bg-white">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">XBRL Financial Details</h1>
                    <p className="text-sm text-gray-500 mt-1">Detailed filings extracted directly from XBRL (Excel) reports used for advanced analysis. Control visibility and organization of financial metrics.</p>
                </div>

                <XBRLDataViewerEnhanced symbol={symbol} />
            </div>
        </div>
    );
}
