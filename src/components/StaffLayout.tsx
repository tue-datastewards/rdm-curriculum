import { Link, NavLink, Outlet } from 'react-router-dom'
import { curriculum } from '../data/curriculum'
import { asset } from '../lib/assets'
import { cn } from '../lib/cn'
import { useNoindex } from '../lib/useNoindex'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm transition hover:text-brand',
    isActive ? 'text-brand underline decoration-2 underline-offset-8' : 'text-ink',
  )

export function StaffLayout() {
  useNoindex()

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:border focus:border-brand focus:bg-paper focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <header className="print-hide sticky top-0 z-30 border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
          <Link to="/curriculum" className="flex min-w-0 items-center gap-3">
            <img
              src={asset('brand/tue-logo-wordmark-purple.svg')}
              alt="TU/e"
              className="h-6 w-auto sm:h-7"
            />
            <span aria-hidden="true" className="hidden h-6 w-px bg-rule sm:block" />
            <span className="text-sm font-bold tracking-tight text-ink">
              RDM Curriculum
              <span className="hidden text-muted sm:inline"> · Staff</span>
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-3 sm:gap-5" aria-label="Staff">
            <NavLink to="/curriculum" end className={navClass}>
              Alignment
            </NavLink>
            <Link to="/" className="text-sm text-muted transition hover:text-brand">
              <span className="sm:hidden">Course</span>
              <span className="hidden sm:inline">Learner site</span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="print-main mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        <Outlet />
      </main>

      <footer className="print-hide border-t border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-8">
          <p>
            {curriculum.course.title} · {curriculum.course.version}. Staff view,
            not linked from the learner navigation.
          </p>
          <Link to="/" className="hover:text-brand hover:underline">
            Learner site
          </Link>
        </div>
      </footer>
    </div>
  )
}
