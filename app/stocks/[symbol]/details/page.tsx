'use client';
import { useParams } from 'next/navigation';
import XBRLDataViewerEnhanced from '../../_components/XBRLDataViewerEnhanced';

export default function DetailsPage() {
    const params = useParams();
    const symbol = params.symbol as string;

    return (
        <div
            className="flex-1 min-h-screen"
            style={{ background: 'linear-gradient(135deg, #070b17 0%, #0a0f1e 60%, #06090f 100%)' }}
        >
            {/* Main Content */}
            <div className="w-full p-4 sm:p-6 h-full">
                <XBRLDataViewerEnhanced symbol={symbol} />
            </div>
        </div>
    );
}