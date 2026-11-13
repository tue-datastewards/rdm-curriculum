import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

export function CiloChip({
  id,
  title,
  className,
}: {
  id: string
  title?: string
  className?: string
}) {
  return (
    <Link
      to={`/cilos/${id}`}
      title={title ? `${id} · ${title}` : id}
      className={cn(
        'inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100',
        className,
      )}
    >
      {id}
      <span className="sr-only">{title ? ` — ${title}` : ''}</span>
    </Link>
  )
}
