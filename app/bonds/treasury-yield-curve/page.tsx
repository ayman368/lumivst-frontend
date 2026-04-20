import YieldCurveAnalysis from '../_components/YieldCurveAnalysis';

export const metadata = {
  title: 'Treasury Yield Curve Analysis | LUMIVST',
  description: 'Comprehensive US Treasury Yield Curve analysis — current rates, historical spreads, inverted yield curve indicator, and interactive time travel.',
};

export default function TreasuryYieldCurvePage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <YieldCurveAnalysis />
    </div>
  );
}
