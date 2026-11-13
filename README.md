# TU/e RDM Curriculum

A public, self-paced course site for researchers and PhD candidates, built around
the TU/e Research Data Management curriculum. The same YAML data also powers a
staff alignment view, so what learners read and what the curriculum team reviews
cannot drift apart.

The design system is the **“This is RDM”** brand kit from the TU/e Data Stewards
Team, used with permission. See [`ATTRIBUTION.md`](ATTRIBUTION.md) and
[`LICENSES.md`](LICENSES.md).

The repository is public. That includes the `word/` source templates and internal
editorial notes; see [Visibility](#visibility).

## Views

| Route | Audience | Content |
|---|---|---|
| `/` | Learners | Course promise, outcomes, module list, resume |
| `/modules` | Learners | Published modules only |
| `/modules/:id` | Learners | Reading view: sections, tasks, resources, self-check |
| `/about` | Learners | Audience, progress, booklet, credits |
| `/curriculum` | Staff | Alignment matrix, content status, coverage, CSV export |
| `/curriculum/cilos/:id` | Staff | Every MILO addressing a course outcome, published or not |

Learner views show **published content only**, use learner titles and statements
where editors provided them, and never show teacher activities, internal notes or
editorial status. The staff view is unlinked from the learner navigation and
marked `noindex`, but it is publicly reachable.

## Quick start

```bash
npm install        # Node 22+
npm run dev        # http://localhost:5173
npm run check      # validate data (errors block, warnings print)
npm run build      # validate + typecheck + static build into dist/
npm run preview    # preview the production build
```

## Data model

The YAML files in [`data/`](data) are the single source of truth.

```yaml
# data/course.yml
title: TU/e RDM Curriculum
tagline: Learn to manage research data well   # homepage H1
audience: For researchers and PhD candidates at TU/e
duration: About 45 minutes · self-paced
contact: ""
version: "2026-2027"
description: Research data is the evidence behind your work. …

# data/modules/M01.yml
id: M01
title: Introduction to Research Data Management and Data Management Plan
summary: One or two sentences for cards and the module header.
description: Longer description (staff).
duration: 45 min
level: introductory            # introductory | intermediate | advanced
learningPath: core             # core | elective | all
prerequisites: Any experience in academic research …
published: true                # controls learner visibility
milos:
  - id: M01.A
    statement: Official outcome statement, used in accreditation and the staff view.
    learnerTitle: Why data management matters
    learnerStatement: Explain how a data management plan helps you …
    phase: in-session
    status: complete           # complete | migrated | draft
    published: true            # controls learner visibility
    cilos: [C1, C2, C5]        # the only place the association is stored
    content: |
      Markdown is supported.
    teaching:
      teacher: Internal facilitator notes (never shown to learners).
      learner: Shown as “Your task”.
    resources:
      - label: Netherlands Code of Conduct for Research Integrity
        url: https://www.knaw.nl/…
    assessment: |
      Shown as “Check your understanding”.
    notes: Internal editorial note (never shown to learners).
```

Course outcomes live in `data/cilos/C1.yml` … `C5.yml`, so the editor can use a
real relation picker rather than typed IDs.

### Publishing rules

- `published: false` on a module hides it from the course, search and progress.
- `published: false` on a MILO hides that section from learners and search.
- Drafts remain visible in `/curriculum`, so gaps stay reviewable.
- Validation (`npm run check`) enforces:
  - unique IDs, CILO references that exist, MILO IDs matching their module;
  - published modules need a summary, a duration and at least one published MILO;
  - published MILOs need content;
  - warnings for empty components, unlinked MILOs, uncovered CILOs, and
    resources without links.

Warnings do not block deployment; errors do.

### Markdown

`content`, `teaching.teacher`, `teaching.learner` and `assessment` are rendered
as Markdown. Bullets (`- `), bold, links and inline code are supported. The
styling uses the brand kit's square bullets and purple links.

## Learner features

- **Progress** — section checkmarks and module completion are stored in
  `localStorage` (`rdm-curriculum:progress:v1`). No account, no server, no
  tracking. “Continue where you left off” uses the last visited module/section;
  progress can be reset on `/about`.
- **Search** — a build-time index over published modules and sections, opened
  with the header button or `/`. Results respect published flags.
- **Print / PDF** — module pages have a print stylesheet with the brand rules,
  and a print button on desktop and mobile.

## Brand system

`src/styles/rdm-tokens.css` is a copy of the kit's `tokens/tokens.css`; the
Tailwind theme maps those variables with `@theme inline`. Print and screen share
the same colour, type and spacing tokens.

Assets in `public/brand/` are copied from the kit at **v1.0.0** by:

```bash
BRANDKIT_PATH=~/dev/tue-rdm-brandkit npm run vendor:brand
```

The script copies the purple/white TU/e wordmarks, the stacked mark (favicon),
the booklet QR, a filtered 10-symbol icon sprite, and a recoloured four-row
wallpaper tile for the hero. The wallpaper is the only modified asset: its fill
was changed from `#6E4061` to `#4A133C` for use on the purple band.

Public use of the logo and icons is authorised; see
[`ATTRIBUTION.md`](ATTRIBUTION.md). Keep the written confirmation with the
project records. Avenir Next is commercial and not distributed; the site uses it
when installed and falls back to Avenir/Helvetica Neue/Arial.

## Editing content

Editors use [Pages CMS](https://app.pagescms.org) with their GitHub account; the
repository's [`.pages.yml`](.pages.yml) defines the forms. Saving commits to
`main`, which triggers the Pages deployment.

Setup, once per project:

1. Add editors as collaborators with **write** access to the repository.
2. Sign in at <https://app.pagescms.org> with GitHub; install the Pages CMS GitHub
   App for this repository when prompted.
3. Open the repository and confirm the **Course**, **Course outcomes** and
   **Modules** sections appear.
4. Add the remaining editors; each signs in with their own GitHub account.

`EDITING.md` is the one-page guide for non-technical editors.

## Deployment

The site is a static build deployed with GitHub Actions:

1. Create a public repository and push this project to `main`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every
   push.
4. The site is published at `https://<owner>.github.io/<repo>/`.

`BASE_PATH` is derived from the repository name. Override it in the workflow if:

- the site is an `<owner>.github.io` user/organization site, or
- a custom domain serves the site from the root (`BASE_PATH: /`).

`scripts/postbuild.mjs` writes `404.html` for client-side routes and `.nojekyll`
so GitHub Pages does not run Jekyll over the build.

## Visibility

The repository is public, and the published site is public. Two consequences:

- `/curriculum` is reachable by anyone who knows the URL. It is `noindex` and
  unlinked, but it is not access-controlled.
- The `word/` templates and editorial notes in `data/` are readable in the
  repository. Remove or relocate anything that should not be public **before**
  the first push; git history is not removed by deleting files later.

## Project structure

```
data/                      curriculum YAML (single source of truth)
public/brand/              vendored brand assets
public/robots.txt          public crawler policy
scripts/check.ts           validation CLI
scripts/vendor-brand.mjs   copies tokens/assets from the brand kit
src/components/            layout, search, icons, progress
src/pages/                 learner views
src/staff/                 alignment matrix and CILO detail
src/data/                  schema, loader, derived learner/staff views
src/lib/                   progress store, search index, helpers
src/styles/                brand tokens
```

## Deliberate decisions

- **Static site, no backend.** Content is YAML in git: reviewable, portable and
  archivable. Progress is the only state, and it stays in the browser.
- **Official and learner wording are separate fields.** Accreditation statements
  stay intact; learners get readable headings without editing the outcomes.
- **Publish flags, not status badges.** “Draft” and “published” are different
  questions; learners only ever see the latter.
- **Single JS bundle.** Deploys replace hashed chunks, so lazy routes could 404
  for a reader with an open tab.
- **Staff views live in the same build** so there is no second deployment or data
  copy to keep in sync.

## Roadmap

- Add modules M02–M05; M06 is imported as a reviewable draft and needs an
  editorial pass before it is published.
- Optional Word importer/exporter for the instructional design templates.
- Optional cohort feedback at the end of a module (no accounts needed).
