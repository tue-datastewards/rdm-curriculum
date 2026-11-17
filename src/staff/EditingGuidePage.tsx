import { Link } from 'react-router-dom'
import editingGuide from '../../EDITING.md?raw'
import { Markdown } from '../components/Markdown'
import { useTitle } from '../lib/useTitle'

// The Markdown source starts with its own H1; the page header supplies that.
const guideBody = editingGuide.replace(/^# .+\n+/, '')

const steps = [
  {
    label: 'Sign in',
    body: 'Open Pages CMS with your GitHub account and install the app for this repository. You need write access to save.',
  },
  {
    label: 'Edit',
    body: 'Choose Course, Course outcomes or Modules. Official outcome statements stay intact; learner titles and statements are what students read.',
  },
  {
    label: 'Publish',
    body: 'Switch “Published to learners” on the module and each ready MILO. Saving commits to main and redeploys in about a minute.',
  },
]

export function EditingGuidePage() {
  useTitle('Editing guide')

  return (
    <div className="space-y-10">
      <div>
        <Link to="/curriculum" className="text-sm text-muted hover:text-brand">
          ← Alignment matrix
        </Link>
      </div>

      <header>
        <p className="rdm-label text-brand">Staff · Editing guide</p>
        <h1 className="rdm-title mt-3">Editing the curriculum</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The course content lives as YAML in the repository and is edited through
          Pages CMS. This is the same guide as{' '}
          <code className="bg-wash px-1 py-0.5 font-mono text-xs">EDITING.md</code>,
          kept here so editors can reach it from the staff view.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="https://app.pagescms.org"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Open Pages CMS ↗
          </a>
          <Link to="/" className="btn btn-outline">
            Learner site
          </Link>
        </div>
      </header>

      <section aria-label="Editing workflow">
        <div className="grid border-l border-t border-rule sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.label} className="border-b border-r border-rule p-5">
              <p className="rdm-label text-brand">
                {String(index + 1).padStart(2, '0')} · {step.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <article className="max-w-3xl border-t border-rule pt-8">
        <Markdown>{guideBody}</Markdown>
      </article>

      <p className="border-t border-rule pt-6 text-xs leading-relaxed text-muted">
        The repository and the published course are public. “Internal” notes and
        teacher activities are visible in the repository and the staff view, so do
        not store confidential information there.
      </p>
    </div>
  )
}
