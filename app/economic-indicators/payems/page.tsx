import EconomicIndicatorView from '../_components/EconomicIndicatorView';

export default function PayemsPage() {
  return (
    <EconomicIndicatorView 
      indicatorCode="PAYEMS" 
      title="All Employees, Total Nonfarm" 
      yAxisLabel="Thousands of Persons" 
    />
  );
}
