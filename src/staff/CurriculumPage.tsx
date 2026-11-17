import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { curriculum } from '../data/curriculum'
import {
  allMilos,
  alignmentGaps,
  ciloCoverage,
  moduleCiloIds,
  publishedEntries,
  publishedModules,
  stats,
} from '../data/derive'
import { missingComponents } from '../data/schema'
import { cn } from '../lib/cn'
import { downloadText, toCsv } from '../lib/csv'
import { useTitle } from '../lib/useTitle'

function heatClass(count: number): string {
  if (count === 0) return 'bg-paper text-rule'
  if (count === 1) return 'bg-wash text-brand'
  if (count === 2) return 'bg-wash-strong text-brand-deep'
  if (count === 3) return 'bg-brand text-paper'
  return 'bg-brand-deep text-paper'
}

function exportCsv() {
  const rows: Array<Array<string | number>> = [
    [
      'module_id',
      'module_title',
      'milo_id',
      'milo_statement',
      'learner_title',
      'cilo_ids',
      'status',
      'published',
    ],
  ]

  for (const module of curriculum.modules) {
    for (const milo of module.milos) {
      rows.push([
        module.id,
        module.title,
        milo.id,
        milo.statement,
        milo.learnerTitle,
        milo.cilos.join(' '),
        milo.status,
        milo.published ? 'yes' : 'no',
      ])
    }
  }

  downloadText(
    'rdm-curriculum-alignment.csv',
    `\uFEFF${toCsv(rows)}`,
    'text/csv;charset=utf-8',
  )
}

export function CurriculumPage() {
  useTitle('Curriculum alignment')
  const [query, setQuery] = useState('')

  const summary = stats(curriculum)
  const published = publishedEntries(curriculum)
  const gaps = alignmentGaps(curriculum)
  const coverage = ciloCoverage(curriculum)
  const hidden = allMilos(curriculum).filter(({ milo }) => !milo.published)
  const openItems =
    gaps.unalignedMilos.length +
    gaps.incompleteMilos.length +
    gaps.uncoveredCilos.length

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    return curriculum.modules
      .map((module) => ({
        module,
        milos: module.milos.filter((milo) =>
          term
            ? `${milo.id} ${milo.statement} ${milo.learnerTitle} ${milo.content}`
                .toLowerCase()
                .includes(term)
            : true,
        ),
      }))
      .filter((group) => !term || group.milos.length > 0)
  }, [query])

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="rdm-label text-brand">Staff · Curriculum alignment</p>
          <h1 className="rdm-title mt-3">Alignment matrix</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            All modules and MILOs, including content that is hidden from learners.
            The learner site only shows published modules, published sections and
            their learner-facing text.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} className="btn btn-outline">
            Export CSV
          </button>
          <button type="button" onClick={() => window.print()} className="btn btn-outline">
            Print
          </button>
        </div>
      </header>

      <section
        aria-labelledby="editing-heading"
        className="flex flex-col gap-5 border border-rule bg-wash p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="max-w-2xl">
          <p id="editing-heading" className="rdm-label text-brand">
            Editing this content
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Sign in at Pages CMS, edit the form, and switch “Published to learners”
            when a section is ready. Saves deploy in about a minute.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to="/curriculum/guide" className="btn btn-outline">
            Editing guide
          </Link>
          <a
            href="https://app.pagescms.org"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Pages CMS ↗
          </a>
        </div>
      </section>

      <section aria-label="Summary">
        <dl className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
          {[
            { label: 'Modules', value: `${summary.modules} (${publishedModules(curriculum).length} published)` },
            { label: 'MILOs', value: `${summary.milos} (${published.length} published)` },
            { label: 'CILO links', value: summary.links },
            { label: 'Open items', value: openItems },
          ].map((item) => (
            <div key={item.label} className="bg-paper px-4 py-3">
              <dt className="rdm-label text-muted">{item.label}</dt>
              <dd className="mt-1 text-lg font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className="rdm-title text-2xl">
          Content status
        </h2>
        <p className="mt-2 text-sm text-muted">
          Published content is visible to learners. Drafts and migrated content can
          be reviewed here without appearing on the course site.
        </p>

        <div className="mt-6 grid gap-px border border-rule bg-rule lg:grid-cols-3">
          <div className="bg-paper p-5">
            <h3 className="rdm-label text-muted">Hidden from learners</h3>
            {hidden.length === 0 ? (
              <p className="mt-2 text-sm text-muted">None — every MILO is published.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {hidden.map(({ module, milo }) => (
                  <li key={milo.id}>
                    <Link
                      to={`/modules/${module.id}#${milo.id}`}
                      className="font-mono text-xs font-bold text-brand hover:underline"
                    >
                      {milo.id}
                    </Link>
                    <span className="text-muted">
                      {' '}
                      — {milo.status}
                      {missingComponents(milo).length > 0
                        ? `, missing ${missingComponents(milo).join(', ')}`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-paper p-5">
            <h3 className="rdm-label text-muted">MILOs without a CILO</h3>
            {gaps.unalignedMilos.length === 0 ? (
              <p className="mt-2 text-sm text-muted">None — every MILO is linked.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {gaps.unalignedMilos.map(({ module, milo }) => (
                  <li key={milo.id}>
                    <Link
                      to={`/modules/${module.id}#${milo.id}`}
                      className="font-mono text-xs font-bold text-brand hover:underline"
                    >
                      {milo.id}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-paper p-5">
            <h3 className="rdm-label text-muted">Uncovered CILOs</h3>
            {gaps.uncoveredCilos.length === 0 ? (
              <p className="mt-2 text-sm text-muted">None — every CILO is covered.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {gaps.uncoveredCilos.map((cilo) => (
                  <li key={cilo.id}>
                    <Link
                      to={`/curriculum/cilos/${cilo.id}`}
                      className="font-mono text-xs font-bold text-brand hover:underline"
                    >
                      {cilo.id}
                    </Link>
                    <span className="text-muted"> — {cilo.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" className="rdm-title text-2xl">
          Coverage by module
        </h2>
        <p className="mt-2 text-sm text-muted">
          Number of MILOs in each module that address a course outcome.
        </p>

        <div className="mt-4 overflow-x-auto border border-rule">
          <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">            <caption className="sr-only">
              Number of MILOs in each module that address each course intended learning outcome
            </caption>
            <thead>
              <tr className="border-b border-rule bg-wash">
                <th scope="col" className="px-4 py-2.5 text-left rdm-label text-muted">
                  Module
                </th>
                {curriculum.cilos.map((cilo) => (
                  <th key={cilo.id} scope="col" className="w-16 px-2 py-2.5 text-center">
                    <Link
                      to={`/curriculum/cilos/${cilo.id}`}
                      title={cilo.title}
                      className="font-mono text-[11px] font-bold text-brand hover:underline"
                    >
                      {cilo.id}
                    </Link>
                  </th>
                ))}
                <th scope="col" className="w-24 px-3 py-2.5 text-center rdm-label text-muted">
                  Covered
                </th>
              </tr>
            </thead>
            <tbody>
              {curriculum.modules.map((module) => {
                const covered = new Set(moduleCiloIds(module, curriculum.cilos))
                return (
                  <tr key={module.id} className="border-b border-rule last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-paper">
                          {module.id}
                        </span>
                        <Link
                          to={`/modules/${module.id}`}
                          className="text-sm font-bold text-ink hover:text-brand hover:underline"
                        >
                          {module.title}
                        </Link>
                        {!module.published && (
                          <span className="border border-rule px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                            Hidden
                          </span>
                        )}
                      </span>
                    </th>
                    {curriculum.cilos.map((cilo) => {
                      const count = module.milos.filter((milo) =>
                        milo.cilos.includes(cilo.id),
                      ).length
                      return (
                        <td
                          key={cilo.id}
                          className={cn(
                            'border-l border-rule px-2 py-3 text-center font-mono text-xs',
                            heatClass(count),
                          )}
                        >
                          {count === 0 ? '·' : count}
                          <span className="sr-only">
                            {count} MILO{count === 1 ? '' : 's'} address {cilo.id}
                          </span>
                        </td>
                      )
                    })}
                    <td className="border-l border-rule px-3 py-3 text-center text-xs">
                      {covered.size}/{curriculum.cilos.length}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted sm:hidden">
          Scroll the table sideways to see the Covered column.
        </p>
      </section>

      <section aria-labelledby="detail-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="detail-heading" className="rdm-title text-2xl">
              MILOs by course outcome
            </h2>
            <p className="mt-2 text-sm text-muted">
              Official outcomes stay here; the learner view uses the learner title
              and statement.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only">Filter MILOs</span>
            <input
              type="search"
              id="milo-filter"
              name="filter"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter MILOs…"
              className="w-56 border border-rule bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-muted sm:hidden">
          Scroll the table sideways to see all CILO columns.
        </p>

        <div className="mt-4 overflow-x-auto border border-rule">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <caption className="sr-only">
              MILOs and the CILOs they address, with content status and learner visibility
            </caption>
            <thead>
              <tr className="border-b border-rule bg-wash">
                <th scope="col" className="w-[52%] px-4 py-2.5 text-left rdm-label text-muted">
                  Module / MILO
                </th>
                {curriculum.cilos.map((cilo) => (
                  <th key={cilo.id} scope="col" className="w-14 px-2 py-2.5 text-center">
                    <Link
                      to={`/curriculum/cilos/${cilo.id}`}
                      title={cilo.title}
                      className="font-mono text-[11px] font-bold text-brand hover:underline"
                    >
                      {cilo.id}
                    </Link>
                  </th>
                ))}
                <th scope="col" className="px-3 py-2.5 text-left rdm-label text-muted">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 text-left rdm-label text-muted">
                  Learner
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr>
                  <td
                    colSpan={curriculum.cilos.length + 3}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    No MILOs match “{query}”.
                  </td>
                </tr>
              )}

              {groups.map(({ module, milos }) => (
                <ModuleGroup
                  key={module.id}
                  moduleId={module.id}
                  moduleTitle={module.title}
                  hidden={!module.published}
                  count={milos.length}
                  columns={curriculum.cilos.length + 3}
                >
                  {milos.map((milo) => (
                    <tr
                      key={milo.id}
                      className="border-t border-rule align-top hover:bg-wash"
                    >
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <span className="mt-0.5 shrink-0 font-mono text-[11px] font-bold text-muted">
                            {milo.id}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm leading-snug">{milo.statement}</p>
                            {milo.learnerTitle && (
                              <p className="mt-1 text-xs text-muted">
                                Learner: “{milo.learnerTitle}”
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {curriculum.cilos.map((cilo) => {
                        const addressed = milo.cilos.includes(cilo.id)
                        return (
                          <td
                            key={cilo.id}
                            className="border-l border-rule px-2 py-3 text-center"
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'inline-block',
                                addressed ? 'h-2.5 w-2.5 bg-brand' : 'h-1.5 w-1.5 bg-rule',
                              )}
                            />
                            <span className="sr-only">
                              {addressed ? 'Addresses' : 'Does not address'} {cilo.id}
                            </span>
                          </td>
                        )
                      })}
                      <td className="border-l border-rule px-3 py-3">
                        <StatusBadge status={milo.status} />
                      </td>
                      <td className="border-l border-rule px-3 py-3">
                        <span
                          className={cn(
                            'text-[11px] font-bold uppercase tracking-[0.06em]',
                            milo.published ? 'text-brand' : 'text-muted',
                          )}
                        >
                          {milo.published ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </ModuleGroup>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="cilo-heading">
        <h2 id="cilo-heading" className="rdm-title text-2xl">
          Course outcomes
        </h2>
        <div className="mt-4 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
          {curriculum.cilos.map((cilo) => {
            const entries = coverage.get(cilo.id) ?? []
            const visible = entries.filter((entry) => entry.milo.published).length
            return (
              <Link
                key={cilo.id}
                to={`/curriculum/cilos/${cilo.id}`}
                className="group border-b border-r border-rule bg-paper p-5 transition hover:bg-wash"
              >
                <span className="rdm-label text-brand">{cilo.id}</span>
                <h3 className="mt-2 text-base font-bold leading-snug group-hover:text-brand">
                  {cilo.title}
                </h3>
                <p className="mt-2 text-xs text-muted">
                  {visible} published / {entries.length} total MILOs
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ModuleGroup({
  moduleId,
  moduleTitle,
  hidden,
  count,
  columns,
  children,
}: {
  moduleId: string
  moduleTitle: string
  hidden: boolean
  count: number
  columns: number
  children: ReactNode
}) {
  return (
    <>
      <tr className="bg-wash">
        <th scope="colgroup" colSpan={columns} className="px-4 py-2 text-left">
          <span className="flex flex-wrap items-center gap-2">
            <span className="bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-paper">
              {moduleId}
            </span>
            <span className="text-xs font-bold">{moduleTitle}</span>
            <span className="text-[11px] font-normal text-muted">
              {count} MILO{count === 1 ? '' : 's'}
            </span>
            {hidden && (
              <span className="border border-rule px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                Hidden from learners
              </span>
            )}
          </span>
        </th>
      </tr>
      {children}
    </>
  )
}
