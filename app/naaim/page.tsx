import NaaimExposureView from '@/app/economic-indicators/_components/NaaimExposureView';

export const metadata = {
  title: 'NAAIM Exposure Index - Economic Indicators',
  description: 'NAAIM Exposure Index — average equity market exposure reported by active investment managers, with S&P 500 overlay.',
};

export default function NaaimPage() {
  return <NaaimExposureView />;
}
