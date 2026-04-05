import { formatViews } from '@/lib/utils'

interface ViewBadgeProps {
  count: number
  className?: string
}

export function ViewBadge({ count, className = '' }: ViewBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        bg-[rgba(201,165,90,0.12)] text-[#c9a55a] border border-[rgba(201,165,90,0.22)] ${className}`}
    >
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
        <path d="M5 0C5 0 9 3.5 9 6.5C9 8.985 7.209 11 5 11C2.791 11 1 8.985 1 6.5C1 5.2 1.6 4 2.5 3.1C2.5 4.3 3.2 5.1 4 5.5C3.7 4.5 3.8 3.1 5 0Z" fill="#c9a55a"/>
      </svg>
      {formatViews(count)} views
    </span>
  )
}
