import NFPChangeView from '../_components/NFPChangeView';

export const metadata = {
  title: 'Non Farm Payrolls (Change) - Economic Indicators',
  description: 'Monthly change in US Non Farm Payrolls',
};

export default function NFPChangePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <NFPChangeView />
      </div>
    </div>
  );
}
