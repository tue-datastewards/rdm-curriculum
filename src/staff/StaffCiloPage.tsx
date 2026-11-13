import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { curriculum } from '../data/curriculum'
import { ciloCoverage, groupByModule } from '../data/derive'
import { useTitle } from '../lib/useTitle'
import { NotFoundPage } from '../pages/NotFoundPage'

export function StaffCiloPage() {
  const { ciloId } = useParams()
  const cilo = curriculum.cilos.find((item) => item.id === ciloId)
  useTitle(cilo ? `${cilo.id} · ${cilo.title}` : 'Outcome not found')

  if (!cilo) return <NotFoundPage />

  const entries = ciloCoverage(curriculum).get(cilo.id) ?? []
  const groups = groupByModule(entries)
  const published = entries.filter((entry) => entry.milo.published).length

  return (
    <div className="space-y-10">
      <div>
        <Link to="/curriculum" className="text-sm text-muted hover:text-brand">
          ← Alignment matrix
        </Link>
      </div>

      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-brand font-mono text-sm font-bold text-paper">
            {cilo.id}
          </span>
          <p className="rdm-label text-brand">Staff · Course intended learning outcome</p>
        </div>
        <h1 className="rdm-title mt-4 max-w-3xl">{cilo.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          {cilo.statement}
        </p>
        <p className="mt-4 text-xs text-muted">
          {published} published / {entries.length} total MILOs ·{' '}
          {groups.length} module{groups.length === 1 ? '' : 's'}
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="border border-rule p-8 text-center text-sm text-muted">
          No MILO addresses this course outcome yet.
        </div>
      ) : (
        <section className="space-y-6">
          {groups.map(({ module, milos }) => (
            <div key={module.id} className="border border-rule">
              <div className="flex flex-wrap items-center gap-2 border-b border-rule bg-wash px-4 py-3">
                <span className="bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-paper">
                  {module.id}
                </span>
                <Link
                  to={`/modules/${module.id}`}
                  className="text-sm font-bold hover:text-brand hover:underline"
                >
                  {module.title}
                </Link>
                {!module.published && (
                  <span className="border border-rule px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                    Hidden from learners
                  </span>
                )}
              </div>

              <ul className="divide-y divide-rule">
                {milos.map((milo) => {
                  const content = (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-muted">
                          {milo.id}
                        </span>
                        <StatusBadge status={milo.status} />
                        <span
                          className={`text-[11px] font-bold uppercase tracking-[0.06em] ${
                            milo.published ? 'text-brand' : 'text-muted'
                          }`}
                        >
                          {milo.published ? 'Published' : 'Hidden'}
                        </span>
                        <span className="ml-auto flex gap-1">
                          {milo.cilos
                            .filter((id) => id !== cilo.id)
                            .map((id) => (
                              <span
                                key={id}
                                className="border border-rule px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted"
                              >
                                {id}
                              </span>
                            ))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-snug">{milo.statement}</p>
                      {milo.learnerTitle && (
                        <p className="mt-1 text-xs text-muted">
                          Learner: “{milo.learnerTitle}”
                        </p>
                      )}
                    </>
                  )

                  return (
                    <li key={milo.id}>
                      {milo.published ? (
                        <Link
                          to={`/modules/${module.id}#${milo.id}`}
                          className="block px-4 py-3 text-ink transition hover:bg-wash"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="px-4 py-3">{content}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
