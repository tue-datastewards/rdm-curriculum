import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'

export function NotFoundPage() {
  useTitle('Page not found')

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="rdm-label text-brand">404</p>
      <h1 className="rdm-title mt-3">This page does not exist</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The module or section you are looking for may have been renamed, unpublished
        or removed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Back to the course
        </Link>
        <Link to="/modules" className="btn btn-outline">
          Browse modules
        </Link>
      </div>
    </div>
  )
}
