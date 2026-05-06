import EconomicIndicatorView from '../_components/EconomicIndicatorView';
import { indicatorMetadata } from '../_data/indicatorMetadata';

export default function Ic4wsaPage() {
  return (
    <EconomicIndicatorView 
      indicatorCode="IC4WSA" 
      title="4-Week Moving Average of Initial Claims" 
      yAxisLabel="Number"
      metadata={indicatorMetadata.IC4WSA}
    />
  );
}
