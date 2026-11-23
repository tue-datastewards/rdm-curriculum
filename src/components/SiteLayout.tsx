import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { curriculum } from '../data/curriculum'
import { asset } from '../lib/assets'
import { cn } from '../lib/cn'
import { BrandIcon } from './BrandIcon'
import { SearchDialog } from './SearchDialog'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm transition hover:text-brand',
    isActive ? 'text-brand underline decoration-2 underline-offset-8' : 'text-ink',
  )

export function SiteLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { course } = curriculum

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if (event.key === '/' && !typing) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

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
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="RDM Curriculum home">
            <img
              src={asset('brand/tue-logo-wordmark-purple.svg')}
              alt="TU/e"
              className="h-6 w-auto sm:h-7"
            />
            <span aria-hidden="true" className="hidden h-6 w-px bg-rule sm:block" />
            <span className="hidden text-sm font-bold tracking-tight text-ink sm:block">
              RDM Curriculum
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-5" aria-label="Main">
            <NavLink to="/modules" className={navClass}>
              Modules
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-2 border border-rule px-2.5 text-sm text-muted transition hover:border-brand hover:text-brand"
              aria-label="Search the course"
            >
              <BrandIcon name="icon-magnifier-chart" className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden border border-rule px-1 text-[10px] leading-4 sm:inline">
                /
              </kbd>
            </button>
          </nav>
        </div>
      </header>

      <main id="main" className="print-main w-full flex-1">
        <Outlet />
      </main>

      <footer className="print-hide bg-brand-deep text-paper">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <img
                src={asset('brand/tue-logo-wordmark-white.svg')}
                alt="TU/e"
                className="h-7 w-auto"
              />
              <p className="mt-4 max-w-sm text-sm text-paper/85">
                {course.title} · {course.version}
                <br />
                Library and Information Services
              </p>
            </div>

            <nav
              className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:justify-items-start"
              aria-label="Footer"
            >
              <Link to="/" className="text-paper/90 hover:text-paper hover:underline">
                Home
              </Link>
              <Link to="/modules" className="text-paper/90 hover:text-paper hover:underline">
                Modules
              </Link>
              <Link to="/about" className="text-paper/90 hover:text-paper hover:underline">
                About
              </Link>
              <Link
                to="/curriculum"
                className="text-paper/70 hover:text-paper hover:underline"
              >
                For the curriculum team
              </Link>
            </nav>
          </div>

          <div className="mt-10 space-y-1 border-t border-paper/25 pt-6 text-xs text-paper/70">
            <p>
              Course content licensed CC BY 4.0. Site code licensed MIT. Design
              system: “This is RDM” brand kit, TU/e Data Stewards Team, licensed
              CC BY-NC-SA 4.0.
            </p>
            <p>
              TU/e logo used for internal TU/e communication. See{" "}
              <a
                href="https://github.com/tue-datastewards/rdm-curriculum/blob/main/LICENSES.md"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-paper"
              >
                licences and attribution
              </a>
              .
            </p>
          </div>
        </div>
      </footer>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
