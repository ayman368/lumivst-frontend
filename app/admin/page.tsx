"use client";
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { triggerScraperAction } from './actions';

export default function AdminDashboard() {

    const triggerScrape = async (url: string, message: string) => {
        try {
            // نستخدم Server Action هنا!
            const res = await triggerScraperAction(url); 
            if (!res.success) {
                alert(`Error: ${res.error}`);
                return;
            }
            alert(message);
        } catch (error) {
            alert(`Network error: ${error}`);
        }
    };
    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/users" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
                        <p className="text-gray-600">Approve pending registrations and manage existing users.</p>
                    </Link>

                    {/* API Trigger Buttons */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow border border-gray-200 mt-4">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">FRED Economic Data Scrapers</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">Unemployment Rate</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Code: <b>UNRATE</b></p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Monthly</p>
                                        <p>📅 <b>Typical Release:</b> First Friday of each month.</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/UNRATE`, 'Triggered UNRATE. Refresh page soon.')} className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition font-medium">
                                    Scrape UNRATE
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">Nonfarm Payrolls</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Code: <b>PAYEMS</b></p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Monthly</p>
                                        <p>📅 <b>Typical Release:</b> First Friday of each month (NFP).</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/PAYEMS`, 'Triggered PAYEMS. Refresh page soon.')} className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition font-medium">
                                    Scrape PAYEMS
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">Initial Claims</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Code: <b>IC4WSA</b></p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Weekly</p>
                                        <p>📅 <b>Typical Release:</b> Every Thursday.</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/IC4WSA`, 'Triggered IC4WSA. Refresh page soon.')} className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition font-medium">
                                    Scrape IC4WSA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Yield Curve Scrapers */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow border border-gray-200 mt-4">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Yield Curve Scrapers</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">US Treasury Yield Curve</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>FRED API</b> (11 maturities)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily (business days)</p>
                                        <p>📅 <b>Recommended:</b> Run once a week (e.g. Sunday)</p>
                                        <p>📊 <b>Data:</b> 1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/yield-curve`, '✅ Treasury Yield Curve scraper started in background!')} className="w-full bg-indigo-600 text-white py-2 rounded shadow hover:bg-indigo-700 transition font-medium">
                                    Scrape Yield Curve
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">Treasury.gov Daily Rates</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>Treasury.gov CSV</b> (All Maturities)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily (business days)</p>
                                        <p>📅 <b>Fetches:</b> Last 5 business days (smart update)</p>
                                        <p>📊 <b>Fills:</b> Missing days + updates all columns</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/treasury-gov?mode=last5days`, '✅ Treasury.gov Daily Rates scraper started! Fetches all maturities.')} className="w-full bg-emerald-600 text-white py-2 rounded shadow hover:bg-emerald-700 transition font-medium">
                                    Scrape Treasury.gov (Last 5 Days)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Market Data Scrapers */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow border border-gray-200 mt-4">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Market Data Scrapers</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">S&P 500 History</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>Yahoo Finance</b> (OHLCV)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily (business days)</p>
                                        <p>📅 <b>Recommended:</b> Run once a week (e.g. Sunday)</p>
                                        <p>📊 <b>Data:</b> Open, High, Low, Close, Volume since 1990</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/SP500`, '✅ S&P 500 scraper started in background!')} className="w-full bg-indigo-600 text-white py-2 rounded shadow hover:bg-indigo-700 transition font-medium mb-2">
                                    Scrape S&P 500
                                </button>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/sp500-pe`, '✅ S&P 500 PE scraper started in background!')} className="w-full bg-emerald-600 text-white py-2 rounded shadow hover:bg-emerald-700 transition font-medium">
                                    Scrape S&P 500 PE
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">Corporate Spreads</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>FRED API</b> (A & BBB OAS)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily</p>
                                        <p>📅 <b>Fetches:</b> Standard ICE BofA OAS</p>
                                        <p>📊 <b>Data:</b> BAMLC0A3CA & BAMLC0A4CBBB</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/BAMLC0A3CA`, '✅ A Spread scraper started!')} className="w-full bg-blue-600 text-white py-1.5 rounded shadow hover:bg-blue-700 transition font-medium text-sm">
                                        Scrape A Spread
                                    </button>
                                    <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/BAMLC0A4CBBB`, '✅ BBB Spread scraper started!')} className="w-full bg-blue-600 text-white py-1.5 rounded shadow hover:bg-blue-700 transition font-medium text-sm">
                                        Scrape BBB Spread
                                    </button>
                                </div>
                            </div>

                            {/* Market Section */}
                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">S&P 500 Earnings Yield</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>GuruFocus</b> (Selenium Scraper)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily</p>
                                        <p>📅 <b>Fetches:</b> History from GuruFocus Table</p>
                                        <p>📊 <b>Data:</b> S&P 500 E/P Ratio</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/SP500_EY`, '✅ GuruFocus S&P 500 Earnings Yield scraper started in Background! (It uses Selenium, wait a moment)')} className="w-full bg-purple-600 text-white py-2 rounded shadow hover:bg-purple-700 transition font-medium">
                                    Scrape Earnings Yield
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">S&P 500 PE Ratio</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>GuruFocus</b> (Selenium Scraper)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily</p>
                                        <p>📅 <b>Fetches:</b> History from GuruFocus Table</p>
                                        <p>📊 <b>Data:</b> S&P 500 PE Ratio</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/SP500_PE`, '✅ GuruFocus S&P 500 PE Ratio scraper started in Background!')} className="w-full bg-purple-600 text-white py-2 rounded shadow hover:bg-purple-700 transition font-medium">
                                    Scrape PE Ratio
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">A Effective Yield</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>FRED API</b></p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily</p>
                                        <p>📅 <b>Fetches:</b> History from FRED CSV</p>
                                        <p>📊 <b>Data:</b> BAMLC0A3CAEY</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/BAMLC0A3CAEY`, '✅ A Effective Yield scraper started in Background!')} className="w-full bg-purple-600 text-white py-2 rounded shadow hover:bg-purple-700 transition font-medium">
                                    Scrape Effective Yield
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Interest Rates Section ── */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            💹 Interest Rates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">SOFR Futures</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>Barchart</b> (Selenium Scraper)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily</p>
                                        <p>📅 <b>Fetches:</b> All SOFR contracts table</p>
                                        <p>📊 <b>Data:</b> SR*0 Futures Prices</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/sofr-futures`, '✅ Barchart SOFR Futures scraper started in Background!')} className="w-full bg-teal-600 text-white py-2 rounded shadow hover:bg-teal-700 transition font-medium">
                                    Scrape SOFR Futures
                                </button>
                            </div>

                            <div className="p-4 border border-gray-100 rounded bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-blue-800">CME FedWatch</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-2">Source: <b>CME Group</b> (Selenium Scraper)</p>
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>🕒 <b>Update Cycle:</b> Daily</p>
                                        <p>📅 <b>Fetches:</b> FOMC meeting probabilities</p>
                                        <p>📊 <b>Data:</b> Rate hike/cut odds</p>
                                    </div>
                                </div>
                                <button onClick={() => triggerScrape(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/scrape/cme-fedwatch`, '✅ CME FedWatch scraper started in Background!')} className="w-full bg-teal-600 text-white py-2 rounded shadow hover:bg-teal-700 transition font-medium">
                                    Scrape CME FedWatch
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
