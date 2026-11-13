import type { LearningPath, Phase, Status } from '../data/schema'
import { cn } from '../lib/cn'

const statusMeta: Record<Status, { label: string; className: string; title: string }> = {
  complete: {
    label: 'Complete',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    title: 'This outcome has content, teaching activities, resources and assessment.',
  },
  migrated: {
    label: 'Migrated · review',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    title: 'Imported from the previous instructional design template. Needs review.',
  },
  draft: {
    label: 'Draft',
    className: 'border-slate-200 bg-slate-100 text-slate-600',
    title: 'Still being written.',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const meta = statusMeta[status]
  return (
    <span
      title={meta.title}
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  )
}

const phaseMeta: Record<Phase, string> = {
  preparatory: 'Preparatory',
  'in-session': 'In-session',
}

export function PhaseBadge({ phase }: { phase: Phase }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
      {phaseMeta[phase]}
    </span>
  )
}

const pathMeta: Record<LearningPath, string> = {
  core: 'Core track (mandatory)',
  elective: 'Elective',
  all: 'All learning paths',
}

export function LearningPathBadge({ path }: { path: LearningPath }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
      {pathMeta[path]}
    </span>
  )
}
