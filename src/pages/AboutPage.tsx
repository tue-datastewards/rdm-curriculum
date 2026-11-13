import { Link } from 'react-router-dom'
import { curriculum } from '../data/curriculum'
import { learnerStats, publishedEntries } from '../data/derive'
import { asset } from '../lib/assets'
import { progressActions, useProgress } from '../lib/progress'
import { useTitle } from '../lib/useTitle'

export function AboutPage() {
  useTitle('About')
  const progress = useProgress()
  const { course } = curriculum
  const { modules, moduleCount, sections } = learnerStats(curriculum)
  const publishedIds = new Set(publishedEntries(curriculum).map(({ milo }) => milo.id))
  const doneSections = Object.keys(progress.sections).filter(
    (id) => progress.sections[id] && publishedIds.has(id),
  ).length
  const doneModules = Object.keys(progress.modules).filter((id) =>
    modules.some((module) => module.id === id),
  ).length

  function reset() {
    if (window.confirm('Reset all progress on this device? This cannot be undone.')) {
      progressActions.reset()
    }
  }

  const facts = [
    { label: 'Audience', value: course.audience || 'Researchers and PhD candidates' },
    { label: 'Duration', value: course.duration || 'Self-paced' },
    { label: 'Format', value: 'Self-paced, online' },
    { label: 'Modules', value: `${modules.length} published` },
    { label: 'Sections', value: `${sections} in total` },
    { label: 'Version', value: course.version },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="rdm-label text-brand">About</p>
      <h1 className="rdm-title mt-3 max-w-3xl">About this course</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {course.description}
      </p>

      <dl className="mt-10 grid border-t border-rule sm:grid-cols-2">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex gap-6 border-b border-rule py-4 sm:pr-8"
          >
            <dt className="rdm-label w-28 shrink-0 pt-0.5 text-muted">{fact.label}</dt>
            <dd className="text-sm">{fact.value}</dd>
          </div>
        ))}
        {course.contact && (
          <div className="flex gap-6 border-b border-rule py-4 sm:pr-8">
            <dt className="rdm-label w-28 shrink-0 pt-0.5 text-muted">Contact</dt>
            <dd className="text-sm">
              <a href={`mailto:${course.contact}`} className="text-brand hover:underline">
                {course.contact}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-12">
          <section>
            <h2 className="rdm-title text-2xl">Who is this for?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {course.audience || 'Researchers and PhD candidates'}. The course
              assumes some experience with academic research, such as a bachelor,
              master or doctoral project. It is written for researchers who manage
              their own data, not only for data stewards or IT staff.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Each module combines short explanations with practical tasks. You can
              apply the tasks to your current project, or to a project you expect to
              start.
            </p>
          </section>

          <section>
            <h2 className="rdm-title text-2xl">Your progress</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Section checkmarks and module completion are stored in this browser
              only. There is no account and no tracking. Clearing your browser data,
              or using another device, starts a fresh record.
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border border-rule p-5">
              <div>
                <p className="rdm-label text-muted">On this device</p>
                <p className="mt-1 text-sm">
                  {doneSections} of {sections} sections · {doneModules} of {moduleCount}{' '}
                  modules complete
                </p>
              </div>
              <button type="button" onClick={reset} className="btn btn-outline">
                Reset progress
              </button>
            </div>
          </section>

          <section>
            <h2 className="rdm-title text-2xl">Course material</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              The modules build on <em>Introduction to Research Data Management</em>{' '}
              (2nd edition, 2026), published by the TU/e Data Stewards Team. The
              booklet is the reference text and goes into more detail than the
              course.
            </p>

            <a
              href="https://edu.nl/jyu76"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-5 border border-rule p-4 transition hover:border-brand"
            >
              <img src={asset('brand/qr-rdm.svg')} alt="" width={72} height={72} />
              <span>
                <span className="rdm-label block text-brand">Read the booklet</span>
                <span className="mt-1 block text-sm text-ink">
                  Scan the code or open edu.nl/jyu76 ↗
                </span>
              </span>
            </a>
          </section>

          <section>
            <h2 className="rdm-title text-2xl">For the curriculum team</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              The alignment matrix, coverage counts and content status are available
              in the staff view. Learners do not see drafts or internal notes.
            </p>
            <Link to="/curriculum" className="btn btn-outline mt-5">
              Open the staff view
            </Link>
          </section>
        </div>

        <aside className="border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="rdm-label text-muted">Credits</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Course content and intended learning outcomes: TU/e Research Data
            Management curriculum team, Library and Information Services.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Design system: “This is RDM” brand kit, TU/e Data Stewards Team,
            derived from the 2026 RDM booklet. Licensed CC BY-NC-SA 4.0.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            TU/e logo used for internal TU/e communication. Avenir Next is a
            commercial typeface; this site uses it when installed and falls back to
            the system sans-serif otherwise.
          </p>
        </aside>
      </div>
    </div>
  )
}
