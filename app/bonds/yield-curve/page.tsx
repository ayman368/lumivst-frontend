import DynamicYieldCurve from '../_components/DynamicYieldCurve';

export const metadata = {
  title: 'Dynamic Yield Curve'
};

export default function YieldCurvePage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Bonds</h1>
      <DynamicYieldCurve />
    </div>
  );
}
