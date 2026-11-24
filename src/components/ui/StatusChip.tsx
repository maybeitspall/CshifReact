import { STATUS_LABEL, nextStatus } from '@/lib/metrics'
import type { ActivityStatus } from '@/types'

const STATUS_ICON: Record<ActivityStatus, string> = {
  belum:         'i-circle',
  selesai:       'i-check',
  setengah:      'i-half',
  terkendala:    'i-flag',
  tidak_selesai: 'i-cross',
}

interface StatusChipProps {
  status: ActivityStatus
  activityId: string
  onToggle: (nextStatus: ActivityStatus) => void
}

export default function StatusChip({ status, activityId, onToggle }: StatusChipProps) {
  const label = STATUS_LABEL[status]
  return (
    <button
      className="chip"
      type="button"
      data-status={status}
      data-activity-id={activityId}
      aria-label={`Status ${label}. Ketuk untuk mengubah`}
      onClick={() => onToggle(nextStatus(status))}
    >
      <svg className="icon" aria-hidden="true">
        <use href={`#${STATUS_ICON[status]}`} />
      </svg>
      <span>{label}</span>
    </button>
  )
}
