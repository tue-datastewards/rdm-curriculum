import type { Status } from '../data/schema'
import { cn } from '../lib/cn'

const meta: Record<Status, { label: string; className: string; title: string }> = {
  complete: {
    label: 'Complete',
    className: 'border-ink text-ink',
    title: 'Written and reviewed.',
  },
  migrated: {
    label: 'Migrated',
    className: 'border-brand text-brand',
    title: 'Imported from the previous instructional design template; needs review.',
  },
  draft: {
    label: 'Draft',
    className: 'border-rule text-muted',
    title: 'Still being written; hidden from learners.',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const item = meta[status]
  return (
    <span
      title={item.title}
      className={cn(
        'inline-flex border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]',
        item.className,
      )}
    >
      {item.label}
    </span>
  )
}
