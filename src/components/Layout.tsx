import { Link, NavLink, Outlet } from 'react-router-dom'
import { curriculum } from '../data/curriculum'
import { cn } from '../lib/cn'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm transition',
    isActive
      ? 'bg-indigo-50 font-medium text-indigo-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )

function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-8 w-8 shrink-0 rounded-lg"
    >
      <rect width="32" height="32" rx="8" fill="#1e1b4b" />
      <path
        d="M9 10.5 16 7l7 3.5-7 3.5-7-3.5Zm0 5.5 7 3.5 7-3.5M9 21.5l7 3.5 7-3.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Layout() {
  const { course } = curriculum

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      <header className="print-hide sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-slate-900">
                RDM Curriculum
              </span>
              <span className="block truncate text-[11px] text-slate-500">
                {course.version}
              </span>
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1" aria-label="Main">
            <NavLink to="/" end className={navClass}>
              Overview
            </NavLink>
            <NavLink to="/matrix" className={navClass}>
              Alignment matrix
            </NavLink>
          </nav>
        </div>
      </header>

      <main
        id="main"
        className="print-main mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
      >
        <Outlet />
      </main>

      <footer className="print-hide border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {course.title} · {course.version}. Content lives in{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-600">
              data/
            </code>{' '}
            as YAML and is versioned in git.
          </p>
          <a
            href="https://app.pagescms.org"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
          >
            Edit content in Pages CMS ↗
          </a>
        </div>
      </footer>
    </div>
  )
}
