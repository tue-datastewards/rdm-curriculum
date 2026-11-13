import { Link } from 'react-router-dom'
import { ModuleRow } from '../components/ModuleRow'
import { curriculum } from '../data/curriculum'
import { learnerStats } from '../data/derive'
import { useTitle } from '../lib/useTitle'

export function ModulesPage() {
  useTitle('Modules')
  const { modules } = learnerStats(curriculum)

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="rdm-label text-brand">Course</p>
      <h1 className="rdm-title mt-3">Modules</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Work through the modules in order, or jump straight to the topic you need.
        Each module takes about the time shown and ends with a task you can apply
        to your own research.
      </p>

      {modules.length === 0 ? (
        <div className="mt-12 border border-rule p-8 text-center">
          <p className="text-sm text-muted">
            No modules have been published yet.{' '}
            <Link to="/curriculum" className="font-bold text-brand hover:underline">
              Staff view
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-10 border-b border-rule">
          {modules.map((module) => (
            <ModuleRow key={module.id} module={module} />
          ))}
        </div>
      )}

      <p className="mt-10 text-sm text-muted">
        Looking for the curriculum matrix?{' '}
        <Link to="/curriculum" className="text-brand hover:underline">
          Staff view
        </Link>
      </p>
    </div>
  )
}
