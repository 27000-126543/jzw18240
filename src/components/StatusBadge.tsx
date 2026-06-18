import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'bg-amber-100 text-amber-800' },
  approved: { label: '已通过', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
  settled: { label: '已核销', className: 'bg-blue-100 text-blue-800' },
  cancelled: { label: '已取消', className: 'bg-gray-100 text-gray-600' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
