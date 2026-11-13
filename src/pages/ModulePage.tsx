import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { LearningPathBadge, PhaseBadge, StatusBadge } from '../components/Badges'
import { CiloChip } from '../components/CiloChip'
import { Empty, Field } from '../components/Field'
import { Markdown } from '../components/Markdown'
import { curriculum } from '../data/curriculum'
import { moduleCiloIds } from '../data/derive'
import type { Milo } from '../data/schema'
import { useTitle } from '../lib/useTitle'
import { NotFoundPage } from './NotFoundPage'

function Resources({ milo }: { milo: Milo }) {
  if (milo.resources.length === 0) return <Empty />

  return (
    <ul className="space-y-1.5 text-sm leading-relaxed text-slate-700">
      {milo.resources.map((resource) => (
        <li key={resource.label} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
          <span>
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
              >
                {resource.label} ↗
              </a>
            ) : (
              resource.label
            )}
            {resource.note && <span className="text-slate-500"> — {resource.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

function MiloCard({ milo }: { milo: Milo }) {
  return (
    <article
      id={milo.id}
      className="print-break scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-white">
            {milo.id}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
              {milo.statement}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={milo.status} />
              <PhaseBadge phase={milo.phase} />
              <span className="ml-1 inline-flex flex-wrap items-center gap-1">
                {milo.cilos.length === 0 ? (
                  <span className="text-[11px] font-medium text-rose-600">
                    No CILO linked
                  </span>
                ) : (
                  milo.cilos.map((id) => (
                    <CiloChip
                      key={id}
                      id={id}
                      title={curriculum.cilos.find((cilo) => cilo.id === id)?.title}
                    />
                  ))
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5">
        <Field label="Content / essential concepts">
          {milo.content.trim() ? <Markdown>{milo.content}</Markdown> : <Empty />}
        </Field>

        <Field label="Teaching-learning strategies">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <h5 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                Teacher&rsquo;s activity
              </h5>
              <div className="mt-1.5">
                {milo.teaching.teacher.trim() ? (
                  <Markdown>{milo.teaching.teacher}</Markdown>
                ) : (
                  <Empty />
                )}
              </div>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <h5 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                Learner&rsquo;s activity
              </h5>
              <div className="mt-1.5">
                {milo.teaching.learner.trim() ? (
                  <Markdown>{milo.teaching.learner}</Markdown>
                ) : (
                  <Empty />
                )}
              </div>
            </div>
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Resources">
            <Resources milo={milo} />
          </Field>
          <Field label="Assessment">
            {milo.assessment.trim() ? <Markdown>{milo.assessment}</Markdown> : <Empty />}
          </Field>
        </div>

        {milo.notes && (
          <div className="rounded-lg border-l-2 border-amber-300 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
            <span className="font-semibold">Note. </span>
            {milo.notes}
          </div>
        )}
      </div>
    </article>
  )
}

export function ModulePage() {
  const { moduleId } = useParams()
  const { hash } = useLocation()
  const module = curriculum.modules.find((item) => item.id === moduleId)
  useTitle(module?.title ?? 'Module not found')

  // The route is code-split, so the app-level hash scrolling can run before
  // this page exists. Scroll to the linked MILO once it is on screen.
  useEffect(() => {
    if (!hash) return
    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ block: 'start' })
  }, [hash, moduleId])

  if (!module) return <NotFoundPage />

  const covered = moduleCiloIds(module, curriculum.cilos)
  const counts = {
    complete: module.milos.filter((milo) => milo.status === 'complete').length,
    migrated: module.milos.filter((milo) => milo.status === 'migrated').length,
    draft: module.milos.filter((milo) => milo.status === 'draft').length,
  }

  return (
    <div className="space-y-8">
      <div className="print-hide">
        <Link
          to="/#modules"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-indigo-700"
        >
          <span aria-hidden="true">←</span> All modules
        </Link>
      </div>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-white">
            {module.id}
          </span>
          <LearningPathBadge path={module.learningPath} />
          <span className="text-xs text-slate-500">
            {module.milos.length} MILO{module.milos.length === 1 ? '' : 's'}
          </span>
          {counts.complete > 0 && (
            <span className="text-xs text-emerald-700">{counts.complete} complete</span>
          )}
          {counts.migrated > 0 && (
            <span className="text-xs text-amber-700">{counts.migrated} migrated</span>
          )}
          {counts.draft > 0 && (
            <span className="text-xs text-slate-500">{counts.draft} draft</span>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="print-hide ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Print module
          </button>
        </div>

        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {module.title}
        </h1>
        {module.description && (
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-slate-600">
            {module.description}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Pre-requisites
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {module.prerequisites || 'None specified.'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Course outcomes addressed
            </h2>
            {covered.length === 0 ? (
              <p className="mt-1 text-sm text-rose-600">
                No CILOs linked yet.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {covered.map((id) => (
                  <CiloChip
                    key={id}
                    id={id}
                    title={curriculum.cilos.find((cilo) => cilo.id === id)?.title}
                  />
                ))}
                <span className="text-xs text-slate-500">
                  {covered.length} of {curriculum.cilos.length} CILOs
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="outcomes-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 id="outcomes-heading" className="font-serif text-2xl font-medium text-slate-900">
            Module intended learning outcomes
          </h2>
          <Link
            to="/matrix"
            className="print-hide text-xs font-medium text-indigo-700 hover:underline"
          >
            View in matrix →
          </Link>
        </div>

        {module.milos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              This module has no intended learning outcomes yet.
            </p>
          </div>
        ) : (
          module.milos.map((milo) => (
            <MiloCard key={milo.id} milo={milo} />
          ))
        )}
      </section>
    </div>
  )
}
