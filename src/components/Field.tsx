import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export function Field({
  label,
  children,
  className,
  id,
}: {
  label: string
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={className}>
      <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </h4>
      {children}
    </section>
  )
}

export function Empty({ children = 'Not yet specified' }: { children?: ReactNode }) {
  return <p className={cn('text-sm italic text-slate-400')}>{children}</p>
}
