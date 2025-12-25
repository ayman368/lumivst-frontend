'use client';

import { DividendGrades } from "../../_components/DividendGrades";
import Link from 'next/link';

// Mock Data
const SCORECARD_DATA = {
    dividendGrades: {
        safety: "A+",
        growth: "A+",
        yield: "F",
        consistency: "C-"
    },
    dividendSummary: {
        
        yieldFwd: "0.02%",
        annualPayout: "$0.04",
        payoutRatio: "0.99%",
        fiveYearGrowth: "20.11%",
        dividendGrowthYears: "2 Years"
    },
    lastDividend: {
        amount: "$0.01",
        exDivDate: "12/04/2025",
        payoutDate: "12/26/2025",
        recordDate: "12/04/2025",
        declareDate: "11/19/2025",
        frequency: "Quarterly"
    }
};

const SummarySection = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
        <h3 className="text-xl font-normal text-gray-500 mb-6">{title}</h3>
        {children}
    </div>
);

const DetailItem = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <div className="flex flex-col border-r border-gray-100 last:border-0 px-4 first:pl-0">
        <span className="font-bold text-gray-800 text-sm mb-1">{label}</span>
        <span className="text-xl font-bold text-gray-900">{value}</span>
    </div>
);

export default function DividendsPage({ params }: { params: Promise<{ symbol: string }> }) {
    return (
        <div className="space-y-6">
            <div className="space-y-6">

                {/* Dividend Grades */}
                <DividendGrades data={SCORECARD_DATA.dividendGrades} />



                {/* Dividend Summary */}
                <SummarySection title="Dividend Summary">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6">
                        <div className="flex flex-col border-r border-gray-100 px-4 first:pl-0">
                            <span className="font-bold text-gray-800 text-sm mb-1">Div Yield (FWD)</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.dividendSummary.yieldFwd}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Annual Payout (FWD)</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.dividendSummary.annualPayout}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Payout Ratio</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.dividendSummary.payoutRatio}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">5 Year Growth Rate</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.dividendSummary.fiveYearGrowth}</span>
                        </div>
                        <div className="flex flex-col px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Dividend Growth</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.dividendSummary.dividendGrowthYears}</span>
                        </div>
                    </div>
                </SummarySection>

                {/* Last Announced Dividend */}
                <SummarySection title="Last Announced Dividend">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-y-6">
                        <div className="flex flex-col border-r border-gray-100 px-4 first:pl-0">
                            <span className="font-bold text-gray-800 text-sm mb-1">Amount</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.lastDividend.amount}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Ex-Div Date</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.lastDividend.exDivDate}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Payout Date</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.lastDividend.payoutDate}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Record Date</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.lastDividend.recordDate}</span>
                        </div>
                        <div className="flex flex-col border-r border-gray-100 px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Declare Date</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.lastDividend.declareDate}</span>
                        </div>
                        <div className="flex flex-col px-4">
                            <span className="font-bold text-gray-800 text-sm mb-1">Div Frequency</span>
                            <span className="text-xl font-bold text-gray-900">{SCORECARD_DATA.lastDividend.frequency}</span>
                        </div>
                    </div>
                </SummarySection>

            </div>

        </div>

    );
}
