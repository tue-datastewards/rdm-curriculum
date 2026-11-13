import { Link } from 'react-router-dom'
import { BrandIcon } from '../components/BrandIcon'
import { ModuleRow } from '../components/ModuleRow'
import { curriculum } from '../data/curriculum'
import { learnerStats, publishedCiloCoverage } from '../data/derive'
import { asset } from '../lib/assets'
import { moduleNumber } from '../lib/labels'
import { useProgress } from '../lib/progress'
import { useTitle } from '../lib/useTitle'

export function HomePage() {
  useTitle()
  const progress = useProgress()
  const { course } = curriculum
  const { modules, moduleCount, sections, firstModule } = learnerStats(curriculum)
  const coverage = publishedCiloCoverage(curriculum)

  const resume = progress.lastVisited
  const resumeModule = modules.find((module) => module.id === resume?.moduleId)
  const startHref = resumeModule
    ? `/modules/${resumeModule.id}${resume?.sectionId ? `#${resume.sectionId}` : ''}`
    : firstModule
      ? `/modules/${firstModule.id}`
      : '/modules'

  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-paper">
        <img
          src={asset('brand/wallpaper-dark.svg')}
          alt=""
          aria-hidden="true"
          className="hero-pattern hidden sm:block"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="rdm-label text-paper/85">TU/e · Library and Information Services</p>
          <h1 className="rdm-display mt-5 max-w-3xl">
            {course.tagline || course.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/90">
            {course.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={startHref} className="btn btn-inverse">
              {resume ? 'Continue where you left off' : 'Start the course'}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/modules"
              className="btn border border-paper/60 text-paper hover:bg-paper hover:text-brand"
            >
              Browse modules
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { label: 'Modules', value: moduleCount },
              { label: 'Sections', value: sections },
              { label: 'Duration', value: course.duration || 'Self-paced' },
              { label: 'Account', value: 'Not required' },
            ].map((item) => (
              <div key={item.label}>
                <dt className="rdm-label text-paper/70">{item.label}</dt>
                <dd className="mt-1 text-lg font-bold text-paper">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="outcomes-heading" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="rdm-label text-brand">Course outcomes</p>
        <h2 id="outcomes-heading" className="rdm-title mt-3 max-w-2xl">
          What you&rsquo;ll be able to do
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The course is built around five outcomes. Each module contributes to them
          through practical, research-focused activities.
        </p>

        <ol className="mt-10">
          {curriculum.cilos.map((cilo, index) => {
            const entries = coverage.get(cilo.id) ?? []
            const moduleIds = [...new Set(entries.map((entry) => entry.module.id))]
            return (
              <li
                key={cilo.id}
                className="grid gap-3 border-t border-rule py-6 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-8"
              >
                <span className="rdm-label pt-1 text-brand">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-snug">{cilo.title}</h3>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
                    {cilo.statement}
                  </p>
                  {moduleIds.length > 0 && (
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>Taught in</span>
                      {moduleIds.map((id) => (
                        <Link
                          key={id}
                          to={`/modules/${id}`}
                          className="border border-rule px-2 py-0.5 font-bold text-ink hover:border-brand hover:text-brand"
                        >
                          Module {moduleNumber(id)}
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-labelledby="modules-heading" className="border-t border-rule bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="rdm-label text-brand">Modules</p>
              <h2 id="modules-heading" className="rdm-title mt-3">
                Work through the course
              </h2>
            </div>
            <Link to="/modules" className="text-sm font-bold text-brand hover:underline">
              All modules →
            </Link>
          </div>

          <div className="mt-10 border-b border-rule">
            {modules.map((module) => (
              <ModuleRow key={module.id} module={module} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="bg-wash">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="rdm-label text-brand">How it works</p>
          <h2 id="how-heading" className="rdm-title mt-3 max-w-2xl">
            Learn at your own pace
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: 'icon-funnel-chart' as const,
                title: 'Self-paced',
                body: 'Work through a module in one sitting or return when you have time. Nothing expires.',
              },
              {
                icon: 'icon-target-chart' as const,
                title: 'Progress on this device',
                body: 'Section checkmarks are stored in your browser. No account, no tracking.',
              },
              {
                icon: 'icon-binary-document' as const,
                title: 'Apply it to your project',
                body: 'Each section ends with a task and resources you can use for your own research.',
              },
            ].map((item) => (
              <div key={item.title} className="border-t border-brand/30 pt-6">
                <BrandIcon name={item.icon} className="h-8 w-8 text-brand" />
                <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted">
            <Link to="/about" className="font-bold text-brand hover:underline">
              Who is this course for?
            </Link>{' '}
            {course.audience || 'Researchers and PhD candidates.'}
          </p>
        </div>
      </section>
    </div>
  )
}
