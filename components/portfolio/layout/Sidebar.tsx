'use client'

import {
  HomeIcon,
  RectangleGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ScaleIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { icon: HomeIcon, label: 'السوق', active: false },
  { icon: RectangleGroupIcon, label: 'القطاعات', active: false },
  { icon: BriefcaseIcon, label: 'المحافظ', active: true },
  { icon: ClipboardDocumentListIcon, label: 'قائمة المتابعة', active: false },
  { icon: BanknotesIcon, label: 'التوزيعات النقدية', active: false },
  { icon: MagnifyingGlassIcon, label: 'فلتر الأسهم', active: false },
  { icon: CalendarIcon, label: 'التقويم', active: false },
  { icon: ScaleIcon, label: 'قارن', active: false },
  { icon: NewspaperIcon, label: 'الأخبار', active: false },
]

export default function Sidebar() {
  return (
    <aside className="w-[56px] min-h-screen bg-[var(--bg-surface)] border-l border-[var(--border)] flex flex-col items-center py-4 gap-4 z-10 shrink-0">
      {menuItems.map((item, idx) => (
        <div key={idx} className="group relative">
          <button
            className={`p-2 rounded-lg transition-colors flex items-center justify-center
              ${item.active ? 'bg-[var(--accent-bg)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'}
            `}
          >
            <item.icon className="w-6 h-6" />
          </button>
          
          <div className="absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            {item.label}
          </div>
        </div>
      ))}
    </aside>
  )
}
