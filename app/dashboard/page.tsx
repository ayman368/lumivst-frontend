import { redirect } from 'next/navigation';

export default function DashboardPage() {
    // Redirect to financials by default
    redirect('/dashboard/financials');
}
