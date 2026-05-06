import SpreadIndicatorView from '../_components/SpreadIndicatorView';
import { spreadMetadata } from '../_data/spreadMetadata';

export default function ACorporateSpreadPage() {
  return (
    <SpreadIndicatorView 
      indicatorCode="BAMLC0A3CA" 
      title="ICE BofA Single-A US Corporate Index Option-Adjusted Spread" 
      yAxisLabel="Percent"
      metadata={spreadMetadata.BAMLC0A3CA}
    />
  );
}
