import { redirect } from 'next/navigation';

export default async function PeersPage({ params }: { params: Promise<{ symbol: string }> }) {
    const resolvedParams = await params;
    redirect(`/stocks/${resolvedParams.symbol}/peers/comparison`);
}
