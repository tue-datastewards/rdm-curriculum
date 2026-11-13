import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'

export function NotFoundPage() {
  useTitle('Page not found')

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="font-mono text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
        This page does not exist
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        The module or course outcome you are looking for may have been renamed or
        removed.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        Back to overview
      </Link>
    </div>
  )
}
