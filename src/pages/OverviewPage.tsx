import { Link } from 'react-router-dom'
import { LearningPathBadge } from '../components/Badges'
import { CiloChip } from '../components/CiloChip'
import { curriculum, validationIssues } from '../data/curriculum'
import {
  alignmentGaps,
  ciloCoverage,
  moduleCiloIds,
  stats,
} from '../data/derive'
import { missingComponents } from '../data/schema'
import type { Module } from '../data/schema'
import { cn } from '../lib/cn'
import { useTitle } from '../lib/useTitle'

function ModuleCoverage({ module }: { module: Module }) {
  const covered = new Set(moduleCiloIds(module, curriculum.cilos))
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-center gap-1" aria-hidden="true">
        {curriculum.cilos.map((cilo) => (
          <span
            key={cilo.id}
            title={`${cilo.id} — ${cilo.title}`}
            className={cn(
              'h-1.5 w-4 rounded-full',
              covered.has(cilo.id) ? 'bg-indigo-500' : 'bg-slate-200',
            )}
          />
        ))}
      </span>
      <span className="text-xs text-slate-500">
        {covered.size} of {curriculum.cilos.length} CILOs
      </span>
    </span>
  )
}

function ModuleCard({ module }: { module: Module }) {
  const counts = {
    complete: module.milos.filter((milo) => milo.status === 'complete').length,
    migrated: module.milos.filter((milo) => milo.status === 'migrated').length,
    draft: module.milos.filter((milo) => milo.status === 'draft').length,
  }

  return (
    <Link
      to={`/modules/${module.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-white">
          {module.id}
        </span>
        <LearningPathBadge path={module.learningPath} />
        <span className="ml-auto text-sm text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600">
          →
        </span>
      </div>

      <h3 className="mt-3 font-serif text-xl font-medium leading-snug text-slate-900 group-hover:text-indigo-800">
        {module.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {module.description}
      </p>

      <div className="mt-auto space-y-2.5 pt-5">
        <ModuleCoverage module={module} />
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>
            {module.milos.length} MILO{module.milos.length === 1 ? '' : 's'}
          </span>
          {counts.complete > 0 && (
            <span className="text-emerald-700">{counts.complete} complete</span>
          )}
          {counts.migrated > 0 && (
            <span className="text-amber-700">{counts.migrated} migrated</span>
          )}
          {counts.draft > 0 && <span>{counts.draft} draft</span>}
        </div>
      </div>
    </Link>
  )
}

export function OverviewPage() {
  useTitle()
  const summary = stats(curriculum)
  const coverage = ciloCoverage(curriculum)
  const gaps = alignmentGaps(curriculum)
  const notes =
    gaps.uncoveredCilos.length +
    gaps.unalignedMilos.length +
    gaps.incompleteMilos.length

  const heroStats = [
    { label: 'Modules', value: summary.modules },
    { label: 'Module outcomes', value: summary.milos },
    { label: 'Course outcomes', value: summary.cilos },
    { label: 'CILO–MILO links', value: summary.links },
  ]

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-50 blur-3xl"
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Curriculum · {curriculum.course.version}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
            {curriculum.course.title}
          </h1>
          {curriculum.course.subtitle && (
            <p className="mt-3 text-base font-medium text-indigo-800 sm:text-lg">
              {curriculum.course.subtitle}
            </p>
          )}
          <p className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-slate-600">
            {curriculum.course.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
            {heroStats.map((item) => (
              <div key={item.label} className="bg-white px-4 py-3">
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/matrix"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              Open alignment matrix
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="#modules"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Browse modules
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="guide-heading">
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <div>
            <h2 id="guide-heading" className="text-sm font-semibold text-slate-900">
              How to read this site
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Two levels of outcomes, connected by explicit links.
            </p>
          </div>
          <dl className="text-sm sm:col-span-2 sm:grid sm:grid-cols-3 sm:gap-4">
            <div>
              <dt className="font-mono text-[11px] font-semibold text-indigo-700">CILO</dt>
              <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                Course intended learning outcome — what a researcher can do after the
                whole curriculum.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] font-semibold text-indigo-700">MILO</dt>
              <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                Module intended learning outcome — what a module contributes to one or
                more CILOs.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] font-semibold text-indigo-700">Components</dt>
              <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                Content, teaching-learning strategies, resources and assessment for each
                MILO.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="cilos-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="cilos-heading" className="font-serif text-2xl font-medium text-slate-900">
              Course intended learning outcomes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Intended for all researchers, across different learning paths.
            </p>
          </div>
          <span className="hidden text-xs text-slate-500 sm:inline">{summary.cilos} CILOs</span>
        </div>

        <div className="mt-4 space-y-3">
          {curriculum.cilos.map((cilo) => {
            const entries = coverage.get(cilo.id) ?? []
            const moduleCount = new Set(entries.map((entry) => entry.module.id)).size
            return (
              <article
                key={cilo.id}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-mono text-sm font-semibold text-white">
                  {cilo.id}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug text-slate-900">
                    <Link
                      to={`/cilos/${cilo.id}`}
                      className="hover:text-indigo-800 hover:underline hover:decoration-indigo-300 hover:underline-offset-2"
                    >
                      {cilo.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {cilo.statement}
                  </p>
                  <p className="mt-2.5 text-xs text-slate-500">
                    {entries.length === 0 ? (
                      <span className="font-medium text-rose-600">
                        Not yet addressed by any module outcome
                      </span>
                    ) : (
                      <>
                        Addressed by {entries.length} MILO
                        {entries.length === 1 ? '' : 's'} in {moduleCount} module
                        {moduleCount === 1 ? '' : 's'}
                      </>
                    )}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id="modules" aria-labelledby="modules-heading" className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="modules-heading" className="font-serif text-2xl font-medium text-slate-900">
              Modules
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Each module contributes a set of intended learning outcomes.
            </p>
          </div>
          <span className="hidden text-xs text-slate-500 sm:inline">
            {summary.modules} {summary.modules === 1 ? 'module' : 'modules'} in this overview
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {curriculum.modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section aria-labelledby="health-heading">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="health-heading" className="font-serif text-xl font-medium text-slate-900">
              Alignment check
            </h2>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                notes === 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800',
              )}
            >
              {notes === 0 ? 'No open items' : `${notes} open item${notes === 1 ? '' : 's'}`}
            </span>
          </div>

          {notes === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Every CILO is addressed by at least one MILO, every MILO is linked to a
              CILO, and all components are filled in.
            </p>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Uncovered CILOs
                </h3>
                {gaps.uncoveredCilos.length === 0 ? (
                  <p className="mt-1.5 text-sm text-slate-400">None — all CILOs covered.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {gaps.uncoveredCilos.map((cilo) => (
                      <li key={cilo.id} className="flex items-start gap-2 text-sm">
                        <CiloChip id={cilo.id} title={cilo.title} />
                        <span className="text-slate-600">{cilo.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  MILOs without a CILO
                </h3>
                {gaps.unalignedMilos.length === 0 ? (
                  <p className="mt-1.5 text-sm text-slate-400">None — every MILO is linked.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {gaps.unalignedMilos.map(({ module, milo }) => (
                      <li key={milo.id}>
                        <Link
                          to={`/modules/${module.id}#${milo.id}`}
                          className="font-mono text-xs font-semibold text-indigo-700 hover:underline"
                        >
                          {milo.id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Incomplete MILOs
                </h3>
                {gaps.incompleteMilos.length === 0 ? (
                  <p className="mt-1.5 text-sm text-slate-400">None — all components filled.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {gaps.incompleteMilos.map(({ module, milo }) => (
                      <li key={milo.id}>
                        <Link
                          to={`/modules/${module.id}#${milo.id}`}
                          className="font-mono text-xs font-semibold text-indigo-700 hover:underline"
                        >
                          {milo.id}
                        </Link>
                        <span className="text-slate-500">
                          {' '}
                          — missing {missingComponents(milo).join(', ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {validationIssues.some((issue) => issue.severity === 'error') && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              This data set has validation errors. Run <code>npm run check</code> for details.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/matrix"
              className="text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
            >
              See the full alignment matrix →
            </Link>
            <span className="text-xs text-slate-400">
              Draft and migrated outcomes are published on purpose so gaps stay visible.
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="status-heading" className="print-hide">
        <h2 id="status-heading" className="sr-only">
          Content status
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-100/60 px-4 py-3 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Content status:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Complete ({summary.complete})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Migrated ({summary.migrated})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Draft ({summary.drafts})
          </span>
          <span className="ml-auto text-slate-500">
            Migrated outcomes came from the previous instructional design template.
          </span>
        </div>
      </section>
    </div>
  )
}
