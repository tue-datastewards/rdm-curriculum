import { cn } from '../lib/cn'

export function ProgressBar({
  percent,
  label,
  className,
}: {
  percent: number
  label: string
  className?: string
}) {
  const value = Math.max(0, Math.min(100, percent))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn('h-[3px] w-full bg-rule', className)}
    >
      <div
        className="h-full bg-brand transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
