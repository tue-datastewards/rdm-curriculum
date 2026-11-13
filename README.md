# TU/e RDM Curriculum

A self-paced course site for researchers and PhD candidates, built around the
TU/e Research Data Management curriculum. The same YAML data also powers a staff
alignment view, so what learners read and what the curriculum team reviews can
never drift apart.

The design system is the **“This is RDM”** brand kit from the TU/e Data Stewards
Team. The project is intended for **internal TU/e hosting**; see
[`ATTRIBUTION.md`](ATTRIBUTION.md) and [`LICENSES.md`](LICENSES.md) before
publishing anything outside the university.

## Two views, one data source

| Route | Audience | Content |
|---|---|---|
| `/` | Learners | Course promise, outcomes, module list, resume |
| `/modules` | Learners | Published modules only |
| `/modules/:id` | Learners | Reading view: sections, tasks, resources, self-check |
| `/about` | Learners | Audience, progress, booklet, credits |
| `/curriculum` | Staff | Alignment matrix, content status, coverage, CSV export |
| `/curriculum/cilos/:id` | Staff | Every MILO addressing a course outcome, published or not |
| `/admin/` | Editors | Sveltia CMS form editor (GitLab sign-in) |

Learner views show **published content only**, use learner titles and statements
where editors provided them, and never show teacher activities, internal notes or
editorial status. The staff view is deliberately not in the learner navigation
and the whole site is marked `noindex`.

## Quick start

```bash
npm install        # Node 22+
npm run dev        # http://localhost:5173
npm run check      # validate data (errors block, warnings print)
npm run build      # validate + typecheck + static build into dist/
npm run preview    # preview the production build
```

`npm run dev` and `npm run build` first copy the Sveltia CMS bundle into
`public/admin/` (`npm run vendor:cms`), so the editor is available at `/admin/`.

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

Brand constraints to keep in mind:

- The kit is an **internal TU/e** resource, not an official brand guideline.
- The TU/e logo is a registered trademark and is **internal use only**.
- The Freepik-derived icons are **internal use only** and excluded from the
  kit's CC BY-NC-SA licence.
- Avenir Next is commercial and not distributed; the site uses it when
  installed and falls back to Avenir/Helvetica Neue/Arial.

## Editing content

Editors use Sveltia CMS at `/admin/` and sign in with their **TU/e GitLab**
account. The editor commits directly to the default branch, which triggers the
Pages pipeline.

Setup, once per project:

1. Create the internal GitLab project and push this repository.
2. Register an OAuth application on the GitLab instance:
   - Redirect URI: `https://<pages-url>/admin/`
   - Confidential: **off** (PKCE)
   - Scope: `api`
3. Fill in `public/admin/config.yml`:
   - `backend.repo` → `<group>/<project>`
   - `backend.base_url` / `api_root` → your GitLab host and `/api/v4`
   - `backend.app_id` → the OAuth client ID
4. Give editors the **Developer** role (or higher) on the project.

`EDITING.md` is the one-page guide for non-technical editors.

If the admin bundle is not generated (for example in a bare checkout), run
`npm run vendor:cms`.

## Deployment

The site is a static build and deploys with GitLab Pages:

```bash
npm ci
npm run build
# artifacts: dist/ copied to public/ by .gitlab-ci.yml
```

- `.gitlab-ci.yml` runs validation, builds, and publishes `public/` on the
  default branch.
- `BASE_PATH` defaults to `/$CI_PROJECT_NAME/`; override it in
  **Settings → CI/CD → Variables** if the project is nested in a subgroup or
  uses a custom domain.
- Set the Pages **access level** in the project settings. “Only project
  members” is the safest default for internal branding; “Everyone with access”
  is appropriate for all TU/e users.
- `scripts/postbuild.mjs` writes `404.html` for client-side routes and
  `.nojekyll` (harmless outside GitHub Pages).

## Project structure

```
data/                      curriculum YAML (single source of truth)
public/admin/              Sveltia CMS entry point + config (bundle generated)
public/brand/              vendored brand assets
scripts/check.ts           validation CLI
scripts/vendor-brand.mjs   copies tokens/assets from the brand kit
scripts/vendor-cms.mjs     copies the Sveltia bundle
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

- Add module M06 (*From FAIR to Open*) and the remaining modules.
- Optional Word importer/exporter for the instructional design templates.
- Optional cohort feedback at the end of a module (no accounts needed).
