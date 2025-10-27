'use client'

import { useRouter } from 'next/navigation'

interface LimitSelectorProps {
  currentLimit: number
}

export default function LimitSelector({ currentLimit }: LimitSelectorProps) {
  const router = useRouter()
  
  const handleLimitChange = (newLimit: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('limit', newLimit.toString())
    url.searchParams.set('page', '1') // العودة للصفحة الأولى عند تغيير الحد
    router.push(url.toString())
  }

  return (
    <select 
      value={currentLimit}
      onChange={(e) => handleLimitChange(Number(e.target.value))}
      className="border border-gray-300 rounded px-2 py-1 text-sm"
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
  )
}