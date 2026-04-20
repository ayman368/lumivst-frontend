import EconomicIndicatorView from '../_components/EconomicIndicatorView';

export default function UnratePage() {
  return (
    <EconomicIndicatorView 
      indicatorCode="UNRATE" 
      title="Unemployment Rate" 
      yAxisLabel="Percent" 
    />
  );
}
