import SpreadIndicatorView from '../_components/SpreadIndicatorView';
import { spreadMetadata } from '../_data/spreadMetadata';

export default function BBBCorporateSpreadPage() {
  return (
    <SpreadIndicatorView 
      indicatorCode="BAMLC0A4CBBB" 
      title="ICE BofA BBB US Corporate Index Option-Adjusted Spread" 
      yAxisLabel="Percent"
      metadata={spreadMetadata.BAMLC0A4CBBB}
    />
  );
}
