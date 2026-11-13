import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/Badges'
import { CiloChip } from '../components/CiloChip'
import { curriculum } from '../data/curriculum'
import { ciloCoverage, groupByModule } from '../data/derive'
import { useTitle } from '../lib/useTitle'
import { NotFoundPage } from './NotFoundPage'

export function CiloPage() {
  const { ciloId } = useParams()
  const cilo = curriculum.cilos.find((item) => item.id === ciloId)
  useTitle(cilo ? `${cilo.id} · ${cilo.title}` : 'Outcome not found')

  if (!cilo) return <NotFoundPage />

  const entries = ciloCoverage(curriculum).get(cilo.id) ?? []
  const groups = groupByModule(entries)
  const moduleCount = groups.length

  return (
    <div className="space-y-8">
      <div className="print-hide">
        <Link
          to="/matrix"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-indigo-700"
        >
          <span aria-hidden="true">←</span> Alignment matrix
        </Link>
      </div>

      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 font-mono text-sm font-semibold text-white">
            {cilo.id}
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Course intended learning outcome
          </p>
        </div>

        <h1 className="mt-4 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {cilo.title}
        </h1>
        <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-slate-600">
          {cilo.statement}
        </p>
        <p className="mt-4 text-sm text-slate-500">
          {entries.length === 0 ? (
            <span className="font-medium text-rose-600">
              No module outcome addresses this CILO yet.
            </span>
          ) : (
            <>
              Addressed by <span className="font-medium text-slate-700">{entries.length} MILO
              {entries.length === 1 ? '' : 's'}</span> in{' '}
              <span className="font-medium text-slate-700">{moduleCount} module
              {moduleCount === 1 ? '' : 's'}</span>.
            </>
          )}
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">
            Until a MILO is linked to this outcome, it cannot be evidenced in the
            curriculum.
          </p>
          <Link
            to="/matrix"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:underline"
          >
            Check coverage in the matrix →
          </Link>
        </div>
      ) : (
        <section aria-labelledby="contributing-heading" className="space-y-6">
          <h2 id="contributing-heading" className="font-serif text-2xl font-medium text-slate-900">
            Contributing module outcomes
          </h2>

          {groups.map(({ module, milos }) => (
            <div key={module.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                  {module.id}
                </span>
                <Link
                  to={`/modules/${module.id}`}
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-800 hover:underline"
                >
                  {module.title}
                </Link>
                <span className="text-xs text-slate-500">
                  {milos.length} contributing MILO{milos.length === 1 ? '' : 's'}
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {milos.map((milo) => (
                  <li key={milo.id}>
                    <Link
                      to={`/modules/${module.id}#${milo.id}`}
                      className="block rounded-lg border border-slate-100 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-slate-400">
                          {milo.id}
                        </span>
                        <StatusBadge status={milo.status} />
                        <span className="ml-auto flex flex-wrap gap-1">
                          {milo.cilos
                            .filter((id) => id !== cilo.id)
                            .map((id) => (
                              <CiloChip
                                key={id}
                                id={id}
                                title={curriculum.cilos.find((item) => item.id === id)?.title}
                              />
                            ))}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-snug text-slate-700">
                        {milo.statement}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="print-hide text-xs text-slate-500">
        Extra chips on each row show the other course outcomes the same MILO
        contributes to.
      </p>
    </div>
  )
}
