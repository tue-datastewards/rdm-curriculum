import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Markdown } from '../components/Markdown'
import { ProgressBar } from '../components/ProgressBar'
import { curriculum } from '../data/curriculum'
import {
  moduleNeighbours,
  publishedMilos,
  publishedModules,
} from '../data/derive'
import type { Milo, Module } from '../data/schema'
import { levelLabel, moduleNumber, pathLabel } from '../lib/labels'
import { moduleProgress, progressActions, useProgress } from '../lib/progress'
import type { ProgressState } from '../lib/progress'
import { useTitle } from '../lib/useTitle'
import { NotFoundPage } from './NotFoundPage'

function Resources({ milo }: { milo: Milo }) {
  return (
    <div className="mt-8">
      <p className="rdm-label text-muted">Resources</p>
      <ul className="mt-3 space-y-2">
        {milo.resources.map((resource) => (
          <li key={resource.label} className="flex items-start gap-2.5 text-sm">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-brand" />
            <span>
              {resource.url ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-brand underline decoration-1 underline-offset-2 hover:text-brand-deep"
                >
                  {resource.label} ↗
                </a>
              ) : (
                <span className="font-bold">{resource.label}</span>
              )}
              {resource.note && <span className="text-muted"> — {resource.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Section({
  module,
  milo,
  index,
  progress,
}: {
  module: Module
  milo: Milo
  index: number
  progress: ProgressState
}) {
  const done = Boolean(progress.sections[milo.id])
  const title = milo.learnerTitle || milo.statement
  const outcome = milo.learnerStatement || milo.statement

  return (
    <section id={milo.id} className="print-break scroll-mt-28 border-t border-rule py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="rdm-label text-muted">
            Section {String(index + 1).padStart(2, '0')}
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">
            {title}
          </h2>
        </div>
        <button
          type="button"
          aria-pressed={done}
          onClick={() => {
            progressActions.toggleSection(milo.id)
            progressActions.visit(module.id, milo.id)
          }}
          className={`print-hide shrink-0 border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition ${
            done
              ? 'border-brand bg-brand text-paper'
              : 'border-rule text-muted hover:border-brand hover:text-brand'
          }`}
        >
          {done ? 'Done ✓' : 'Mark done'}
        </button>
      </div>

      <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-brand">
        {outcome}
      </p>

      {milo.content.trim() && (
        <div className="mt-6 max-w-2xl">
          <Markdown>{milo.content}</Markdown>
        </div>
      )}

      {milo.teaching.learner.trim() && (
        <div className="mt-8 max-w-2xl border-l-4 border-brand bg-wash p-5 sm:p-6">
          <p className="rdm-label text-brand">Your task</p>
          <div className="mt-2.5">
            <Markdown>{milo.teaching.learner}</Markdown>
          </div>
        </div>
      )}

      {milo.resources.length > 0 && <Resources milo={milo} />}

      {milo.assessment.trim() && (
        <div className="mt-8 max-w-2xl border border-rule p-5 sm:p-6">
          <p className="rdm-label text-brand">Check your understanding</p>
          <div className="mt-2.5">
            <Markdown>{milo.assessment}</Markdown>
          </div>
        </div>
      )}
    </section>
  )
}

export function ModulePage() {
  const { moduleId } = useParams()
  const { hash } = useLocation()
  const progress = useProgress()
  const [activeSection, setActiveSection] = useState('')

  const module = publishedModules(curriculum).find((item) => item.id === moduleId)
  useTitle(module?.title ?? 'Module not found')

  useEffect(() => {
    if (!module) return
    progressActions.visit(module.id)
  }, [module?.id])

  useEffect(() => {
    if (!module) return
    const elements = publishedMilos(module)
      .map((milo) => document.getElementById(milo.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
    )

    for (const element of elements) observer.observe(element)
    setActiveSection(elements[0]?.id ?? '')
    return () => observer.disconnect()
  }, [module?.id])

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash, module?.id])

  if (!module) return <NotFoundPage />

  const sections = publishedMilos(module)
  const sectionIds = sections.map((milo) => milo.id)
  const status = moduleProgress(progress, sectionIds)
  const { previous, next } = moduleNeighbours(curriculum, module.id)

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="print-hide pt-6">
          <Link to="/modules" className="text-sm text-muted hover:text-brand">
            ← Modules
          </Link>
        </div>

        <header className="mt-5 border-b border-rule pb-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="rdm-label text-brand">Module {moduleNumber(module.id)}</span>
            <span className="rdm-label text-muted">{pathLabel[module.learningPath]}</span>
            <span className="rdm-label text-muted">{levelLabel[module.level]}</span>
            <span className="rdm-label text-muted">{module.duration}</span>
          </div>

          <h1 className="rdm-title mt-4 max-w-4xl">{module.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {module.summary}
          </p>

          <div className="mt-6 max-w-sm">
            <div className="flex items-baseline justify-between gap-4">
              <span className="rdm-label text-muted">Your progress</span>
              <span className="text-xs text-muted">
                {status.done} of {status.total} sections
              </span>
            </div>
            <ProgressBar
              className="mt-2"
              percent={status.percent}
              label={`${status.done} of ${status.total} sections complete`}
            />
          </div>
        </header>

        <section className="print-break mt-8 border border-rule p-6 sm:p-8">
          <h2 className="rdm-label text-brand">In this module you will</h2>
          <ul className="mt-4 space-y-3">
            {sections.map((milo, sectionIndex) => (
              <li key={milo.id} className="flex gap-3 text-[0.95rem] leading-relaxed">
                <span className="mt-0.5 font-mono text-xs font-bold text-brand">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <span>{milo.learnerStatement || milo.statement}</span>
              </li>
            ))}
          </ul>
        </section>

        <details className="print-hide mt-6 border border-rule p-4 lg:hidden">
          <summary className="rdm-label cursor-pointer text-brand">On this page</summary>
          <ol className="mt-3 space-y-2 text-sm">
            {sections.map((milo, sectionIndex) => (
              <li key={milo.id}>
                <a
                  href={`#${milo.id}`}
                  onClick={() => progressActions.visit(module.id, milo.id)}
                  className="flex gap-2 text-muted hover:text-brand"
                >
                  <span className="font-mono text-xs">
                    {String(sectionIndex + 1).padStart(2, '0')}
                  </span>
                  <span>{milo.learnerTitle || milo.statement}</span>
                  {progress.sections[milo.id] && <span className="ml-auto text-brand">✓</span>}
                </a>
              </li>
            ))}
          </ol>
        </details>

        <div className="print-hide mt-6 flex flex-wrap gap-3 lg:hidden">
          <button
            type="button"
            onClick={() =>
              progressActions.setModuleComplete(module.id, sectionIds, !status.complete)
            }
            className={`btn ${status.complete ? 'btn-primary' : 'btn-outline'}`}
          >
            {status.complete ? 'Reopen module' : 'Mark module complete'}
          </button>
          <button type="button" onClick={() => window.print()} className="btn btn-outline">
            Print or save as PDF
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-6xl gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          {sections.map((milo, sectionIndex) => (
            <Section
              key={milo.id}
              module={module}
              milo={milo}
              index={sectionIndex}
              progress={progress}
            />
          ))}

          <nav className="print-hide mt-4 grid gap-px border-t border-rule pt-8 sm:grid-cols-2">
            {previous ? (
              <Link
                to={`/modules/${previous.id}`}
                className="border border-rule p-5 transition hover:border-brand hover:bg-wash"
              >
                <span className="rdm-label text-muted">Previous</span>
                <span className="mt-2 block text-sm font-bold text-ink">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/modules/${next.id}`}
                className="border border-rule p-5 text-right transition hover:border-brand hover:bg-wash sm:col-start-2"
              >
                <span className="rdm-label text-muted">Next</span>
                <span className="mt-2 block text-sm font-bold text-ink">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>

        <aside className="print-hide hidden lg:block">
          <div className="sticky top-24">
            <p className="rdm-label text-muted">On this page</p>
            <ol className="mt-3 space-y-1">
              {sections.map((milo, sectionIndex) => (
                <li key={milo.id}>
                  <a
                    href={`#${milo.id}`}
                    onClick={() => progressActions.visit(module.id, milo.id)}
                    aria-current={activeSection === milo.id ? 'location' : undefined}
                    className={`flex gap-2 border-l-2 py-1 pl-3 text-sm transition ${
                      activeSection === milo.id
                        ? 'border-brand font-bold text-brand'
                        : 'border-rule text-muted hover:border-muted hover:text-ink'
                    }`}
                  >
                    <span className="font-mono text-[11px]">
                      {String(sectionIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">{milo.learnerTitle || milo.statement}</span>
                    {progress.sections[milo.id] && (
                      <span className="ml-auto text-brand">✓</span>
                    )}
                  </a>
                </li>
              ))}
            </ol>

            <div className="mt-6 border-t border-rule pt-4">
              <ProgressBar
                percent={status.percent}
                label={`${status.done} of ${status.total} sections complete`}
              />
              <p className="mt-2 text-xs text-muted">
                {status.done} of {status.total} sections complete
              </p>
              <button
                type="button"
                onClick={() =>
                  progressActions.setModuleComplete(module.id, sectionIds, !status.complete)
                }
                className={`btn mt-4 w-full ${
                  status.complete
                    ? 'border border-brand bg-brand text-paper hover:bg-brand-deep'
                    : 'btn-outline'
                }`}
              >
                {status.complete ? 'Reopen module' : 'Mark module complete'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-2 w-full border border-rule px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-muted transition hover:border-brand hover:text-brand"
              >
                Print or save as PDF
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
