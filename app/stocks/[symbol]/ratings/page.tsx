import { redirect } from 'next/navigation'

export default async function RatingsIndex({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  redirect(`/stocks/${symbol}/ratings/quant-ratings`)
}
