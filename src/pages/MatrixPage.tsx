import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/Badges'
import { curriculum } from '../data/curriculum'
import { moduleCiloIds } from '../data/derive'
import type { Module } from '../data/schema'
import { downloadText, toCsv } from '../lib/csv'
import { cn } from '../lib/cn'
import { useTitle } from '../lib/useTitle'

function heatClass(count: number): string {
  if (count === 0) return 'bg-white text-slate-300'
  if (count === 1) return 'bg-indigo-50 text-indigo-700'
  if (count === 2) return 'bg-indigo-100 text-indigo-800'
  if (count === 3) return 'bg-indigo-200 text-indigo-900'
  return 'bg-indigo-300 text-indigo-950'
}

function exportCsv() {
  const rows: Array<Array<string | number>> = [
    [
      'module_id',
      'module_title',
      'milo_id',
      'milo_statement',
      'cilo_id',
      'cilo_title',
      'status',
    ],
  ]

  for (const module of curriculum.modules) {
    for (const milo of module.milos) {
      if (milo.cilos.length === 0) {
        rows.push([module.id, module.title, milo.id, milo.statement, '', '', milo.status])
        continue
      }
      for (const ciloId of milo.cilos) {
        const cilo = curriculum.cilos.find((item) => item.id === ciloId)
        rows.push([
          module.id,
          module.title,
          milo.id,
          milo.statement,
          ciloId,
          cilo?.title ?? '',
          milo.status,
        ])
      }
    }
  }

  downloadText(
    'rdm-curriculum-alignment.csv',
    `\uFEFF${toCsv(rows)}`,
    'text/csv;charset=utf-8',
  )
}

export function MatrixPage() {
  useTitle('Alignment matrix')
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    return curriculum.modules
      .map((module) => ({
        module,
        milos: module.milos.filter((milo) =>
          term
            ? `${milo.id} ${milo.statement} ${milo.content}`
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Curriculum alignment
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            Alignment matrix
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            How each module outcome contributes to the course intended learning
            outcomes. A filled cell means the MILO explicitly addresses that CILO.
          </p>
        </div>
        <div className="print-hide flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Print
          </button>
        </div>
      </header>

      <section aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" className="font-serif text-2xl font-medium text-slate-900">
          Coverage by module
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Number of MILOs in each module that address a given course outcome.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[344px] table-fixed border-collapse text-sm">
            <caption className="sr-only">
              Number of MILOs in each module that address each course intended learning outcome
            </caption>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="w-16 px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:w-auto sm:px-4">
                  Module
                </th>
                {curriculum.cilos.map((cilo) => (
                  <th key={cilo.id} scope="col" className="w-12 px-1 py-2.5 text-center sm:w-20 sm:px-2">
                    <Link
                      to={`/cilos/${cilo.id}`}
                      title={cilo.title}
                      className="font-mono text-[11px] font-semibold text-indigo-700 hover:underline"
                    >
                      {cilo.id}
                    </Link>
                  </th>
                ))}
                <th scope="col" className="w-14 px-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:w-24 sm:px-3">
                  <span className="hidden sm:inline">Covered</span>
                  <span className="sm:hidden">Total</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {curriculum.modules.map((module) => {
                const covered = new Set(moduleCiloIds(module, curriculum.cilos))
                return (
                  <tr key={module.id} className="border-t border-slate-100">
                    <th scope="row" className="px-2 py-3 text-left font-normal sm:px-4">
                      <Link
                        to={`/modules/${module.id}`}
                        className="group inline-flex items-center gap-2"
                        title={module.title}
                      >
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                          {module.id}
                        </span>
                        <span className="hidden text-sm font-medium text-slate-800 group-hover:text-indigo-800 group-hover:underline sm:inline">
                          {module.title}
                        </span>
                      </Link>
                    </th>
                    {curriculum.cilos.map((cilo) => {
                      const count = module.milos.filter((milo) =>
                        milo.cilos.includes(cilo.id),
                      ).length
                      return (
                        <td
                          key={cilo.id}
                          className={cn(
                            'border-l border-slate-100 px-1 py-3 text-center font-mono text-xs sm:px-2',
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
                    <td className="border-l border-slate-100 px-1 py-3 text-center text-xs text-slate-600 sm:px-3">
                      {covered.size}/{curriculum.cilos.length}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="detail-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="detail-heading" className="font-serif text-2xl font-medium text-slate-900">
              Module outcomes by course outcome
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The same associations, at MILO level.
            </p>
          </div>
          <label className="print-hide flex items-center gap-2 text-sm text-slate-600">
            <span className="sr-only">Filter module outcomes</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter MILOs…"
              className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-slate-500 sm:hidden">
          Scroll the table sideways to see all CILO columns.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <caption className="sr-only">
              Module intended learning outcomes and the course intended learning outcomes they address
            </caption>
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="w-[58%] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Module / module intended learning outcome
                </th>
                {curriculum.cilos.map((cilo) => (
                  <th key={cilo.id} scope="col" className="px-2 py-2.5 text-center">
                    <Link
                      to={`/cilos/${cilo.id}`}
                      title={cilo.title}
                      className="font-mono text-[11px] font-semibold text-indigo-700 hover:underline"
                    >
                      {cilo.id}
                    </Link>
                  </th>
                ))}
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr>
                  <td colSpan={curriculum.cilos.length + 2} className="px-4 py-8 text-center text-sm text-slate-500">
                    No module outcomes match “{query}”.
                  </td>
                </tr>
              )}

              {groups.map(({ module, milos }) => (
                <ModuleGroup key={module.id} module={module} miloCount={milos.length}>
                  {milos.map((milo) => (
                    <tr key={milo.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold text-slate-400">
                            {milo.id}
                          </span>
                          <Link
                            to={`/modules/${module.id}#${milo.id}`}
                            className="text-sm leading-snug text-slate-700 hover:text-indigo-800 hover:underline hover:decoration-indigo-300 hover:underline-offset-2"
                          >
                            {milo.statement}
                          </Link>
                        </div>
                      </td>
                      {curriculum.cilos.map((cilo) => {
                        const addressed = milo.cilos.includes(cilo.id)
                        return (
                          <td key={cilo.id} className="border-l border-slate-100 px-2 py-3 text-center">
                            <span
                              aria-hidden="true"
                              className={cn(
                                'inline-block rounded-full',
                                addressed ? 'h-2.5 w-2.5 bg-indigo-600' : 'h-1.5 w-1.5 bg-slate-200',
                              )}
                            />
                            <span className="sr-only">
                              {addressed ? 'Addresses' : 'Does not address'} {cilo.id}
                            </span>
                          </td>
                        )
                      })}
                      <td className="border-l border-slate-100 px-3 py-3">
                        <StatusBadge status={milo.status} />
                      </td>
                    </tr>
                  ))}
                </ModuleGroup>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> addresses the CILO
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200" /> no explicit link
          </span>
          <span>Rows link to the full module description.</span>
        </p>
      </section>
    </div>
  )
}

function ModuleGroup({
  module,
  miloCount,
  children,
}: {
  module: Module
  miloCount: number
  children: ReactNode
}) {
  return (
    <>
      <tr className="bg-slate-100/80">
        <th
          scope="colgroup"
          colSpan={curriculum.cilos.length + 2}
          className="px-4 py-2 text-left"
        >
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
              {module.id}
            </span>
            <Link
              to={`/modules/${module.id}`}
              className="text-xs font-semibold text-slate-700 hover:text-indigo-800 hover:underline"
            >
              {module.title}
            </Link>
            <span className="text-[11px] font-normal text-slate-500">
              {miloCount} MILO{miloCount === 1 ? '' : 's'}
            </span>
          </span>
        </th>
      </tr>
      {children}
    </>
  )
}
