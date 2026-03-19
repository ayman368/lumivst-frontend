import { redirect } from 'next/navigation';

export default function DetailsIndexPage() {
    // Redirect to the default symbol 1010 details page
    redirect('/stocks/1010/details');
}
