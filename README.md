# RDM Curriculum

A small static site for the TU/e Research Data Management e-learning curriculum.
It makes the two levels of intended learning outcomes visible and keeps them
connected:

- **CILO** — course intended learning outcome
- **MILO** — module intended learning outcome, with content / essential
  concepts, teaching-learning strategies (teacher and learner activity),
  resources, and assessment

The site is a read-only view generated from YAML files in [`data/`](data).
Non-technical editors use [Pages CMS](https://app.pagescms.org) to edit those
files through a form UI; see [`EDITING.md`](EDITING.md).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # validate data (errors fail, warnings print)
npm run build      # check + typecheck + static build into dist/
npm run preview    # preview the production build
```

Requires Node 22 or newer.

## What is where

```
data/
  course.yml           title, subtitle, version, description
  cilos/C1.yml …       one file per course intended learning outcome
  modules/M01.yml …    one file per module, containing its MILOs
src/
  data/schema.ts       Zod schema + referential/editorial checks
  data/curriculum.ts   build-time YAML loading and validation
  data/derive.ts       coverage, gaps, statistics
  pages/               Overview, Alignment matrix, Module, CILO
scripts/check.ts       CLI validation, used by CI and the build
.pages.yml             Pages CMS editor configuration
.github/workflows/     GitHub Pages deployment
word/                  original instructional design templates (source of truth for content)
```

`data/` is the single source of truth. Everything else — the matrix, coverage
counts, gap reports, CSV export — is derived from it, so the views cannot
contradict each other.

## The data model

```yaml
# data/modules/M01.yml
id: M01
title: Introduction to Research Data Management and Data Management Plan
description: What does it mean to manage data responsibly for research? …
learningPath: core          # core | elective | all
prerequisites: Any experience in doing academic research …
milos:
  - id: M01.A
    statement: Explain the purpose and benefits of a Data Management Plan …
    phase: in-session       # preparatory | in-session
    status: complete        # complete | migrated | draft
    cilos: [C1, C2, C5]     # the association, stored in one place only
    content: |
      - What is research data? …
    teaching:
      teacher: Prepare learning materials …
      learner: Read the module …
    resources:
      - label: RDM Handbook
      - label: Netherlands Code of Conduct for Research Integrity
        url: https://www.knaw.nl/…
    assessment: |
      Formative quiz (true or false) …
    notes: Optional internal note, shown on the site.
```

Rules the validator enforces:

- CILO ids look like `C1`; module ids like `M01`; MILO ids like `M01.A`.
- A MILO id must start with its module id.
- Every id is unique; every `cilos` reference must exist.
- Warnings (not errors) for: MILOs without a CILO, CILOs without any MILO,
  modules without MILOs, and MILOs missing a component. This is deliberate:
  unfinished content is published so gaps stay visible.

Markdown is supported in `content`, `teaching.*`, and `assessment` (`- ` for
bullets, `**bold**`, `[text](https://…)`). Images are not used.

## Views

- **Overview** — course description, all CILOs with coverage, module cards, and
  an alignment check that lists uncovered CILOs, unaligned MILOs, and missing
  components.
- **Alignment matrix** — CILO × module coverage heatmap and the full MILO ×
  CILO matrix; filterable; CSV export for spreadsheets and accreditation files.
- **Module** — full instructional design detail per MILO, with CILO chips.
  Print-friendly (use the browser's *Save as PDF*).
- **CILO** — every MILO across modules that addresses a given course outcome,
  grouped by module. This is the view to hand to a review committee.

Deep links work, e.g. `/modules/M01#M01.B`.

## Deploying to GitHub Pages

1. Create a public repository and push this project to `main`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every
   push. `BASE_PATH` is derived from the repository name automatically.
4. For a user/organization site (`<user>.github.io`), set `BASE_PATH: /` in the
   workflow and at build time.

The build writes `404.html` and `.nojekyll` into `dist/` so client-side routes
resolve on GitHub Pages.

To host under a custom domain, keep `BASE_PATH` as `/<repo-name>/` unless the
site is served from the domain root.

## Editing content

- With a GitHub account: sign in at <https://app.pagescms.org>, open the
  repository, and use the *Course*, *Course outcomes*, and *Modules* sections.
  Saving commits to `main`, which triggers a rebuild (about a minute).
- Without a CMS: edit the YAML in `data/` and run `npm run check` before
  committing. Any text editor and the GitHub web editor both work.

The editor configuration lives in `.pages.yml`; the field help text there is
what editors see.

## Deliberate trade-offs

- **No backend.** The content is files in git: free hosting, full history,
  diffs and review, and the site can be archived as a folder. The editing UI is
  provided by Pages CMS on top of git, not by a database.
- **Associations are stored once**, on the MILO. The matrix is computed, so it
  cannot drift from the module pages.
- **Drafts are published** with a status badge. Hiding them would hide the gaps
  that this tool exists to expose.
- **Data access is isolated** in `src/data/curriculum.ts`. If a backend ever
  becomes necessary, the schema and every view stay; only the loader changes.

## Roadmap

- Seed module M06 (*From FAIR to Open*) and further modules.
- Optional Word importer for the existing instructional design templates.
- Optional Word/PDF export in the institutional template.
- Optional editing of matrix cells in the browser (download YAML, commit).
