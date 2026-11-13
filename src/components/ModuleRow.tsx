import { Link } from 'react-router-dom'
import { publishedMilos } from '../data/derive'
import type { Module } from '../data/schema'
import { levelLabel, moduleNumber, pathLabel } from '../lib/labels'
import { moduleProgress, useProgress } from '../lib/progress'
import { ProgressBar } from './ProgressBar'

export function ModuleRow({
  module,
  showPath = true,
}: {
  module: Module
  showPath?: boolean
}) {
  const progress = useProgress()
  const sections = publishedMilos(module)
  const ids = sections.map((milo) => milo.id)
  const status = moduleProgress(progress, ids)

  return (
    <Link
      to={`/modules/${module.id}`}
      className="group -mx-3 grid gap-4 border-t border-rule px-3 py-8 transition hover:bg-wash sm:grid-cols-[4rem_minmax(0,1fr)_13rem] sm:gap-8"
    >
      <div className="rdm-display text-brand transition group-hover:text-brand-deep">
        {moduleNumber(module.id)}
      </div>

      <div className="min-w-0">
        <h3 className="text-xl font-bold leading-snug tracking-tight text-ink group-hover:text-brand">
          {module.title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {module.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>{module.duration}</span>
          <span>{levelLabel[module.level]}</span>
          {showPath && <span>{pathLabel[module.learningPath]}</span>}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:items-end">
        <span className={`rdm-label ${status.complete ? 'text-brand' : 'text-muted'}`}>
          {status.complete
            ? 'Complete'
            : `${status.done} of ${status.total} sections`}
        </span>
        <div className="w-full max-w-[12rem]">
          <ProgressBar
            percent={status.percent}
            label={`${status.done} of ${status.total} sections complete`}
          />
        </div>
      </div>
    </Link>
  )
}
