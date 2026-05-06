import EconomicIndicatorView from '../_components/EconomicIndicatorView';
import { indicatorMetadata } from '../_data/indicatorMetadata';

export default function UnratePage() {
  return (
    <EconomicIndicatorView
      indicatorCode="UNRATE"
      title="Unemployment Rate"
      yAxisLabel="Percent"
      metadata={indicatorMetadata.UNRATE}
      showHeader={true}
    />
  );
}
