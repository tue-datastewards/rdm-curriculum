# Editing the curriculum (no git required)

This guide is for curriculum editors. You do not need to install anything or
know git. Changes are made in a web form and saved to the repository; the public
site rebuilds automatically in about a minute.

## Sign in

1. Go to <https://app.pagescms.org>.
2. Choose **Sign in with GitHub** (create a free GitHub account if you do not
   have one).
3. Ask the maintainer to add your GitHub username as a collaborator on the
   repository. Accept the invitation in your email or on GitHub.
4. Pick the `rdm-curriculum` repository, then the branch `main`.

You will see three sections: **Course**, **Course outcomes (CILOs)** and
**Modules**.

## What the pieces mean

| Piece | Meaning |
|---|---|
| **CILO** | A course intended learning outcome: what a researcher can do after the whole curriculum. There are five, `C1`–`C5`. |
| **MILO** | A module intended learning outcome: what one module contributes. Ids look like `M01.A`. |
| **Link** | Each MILO ticks one or more CILOs. This is the association shown in the alignment matrix. |
| **Components** | Content, teaching-learning strategies (teacher and learner activity), resources, assessment. |

## Editing a module

1. Open **Modules** and choose a module (for example `M01`).
2. Edit the title, description, learning path or pre-requisites.
3. Expand **Module intended learning outcomes (MILOs)**.
4. Open a MILO to edit its statement, phase, status and components.
5. Under **Course outcomes addressed**, tick every CILO the MILO contributes to.
   At least one is required.
6. Press **Save**. The site updates in a minute or two.

You can reorder MILOs by dragging, and add a MILO with **Add item**. Keep the
letter sequence: `M01.A`, `M01.B`, `M01.C`, …

### Formatting

Content, teaching activities and assessment accept Markdown:

```
- A bullet
  - A nested bullet
**bold text**
[link text](https://example.com)
```

Start bullets with `- ` and leave a blank line between paragraphs.

### Status badges

- **Complete** — the MILO is written and reviewed.
- **Migrated — needs review** — imported from the older template; check the
  wording and components.
- **Draft** — still being written. It stays visible on purpose.

Empty components appear as *Not yet specified* and are listed in the
**Alignment check** panel on the overview page. That panel is your to-do list.

## Adding a module

1. **Modules → New module**.
2. Enter the module id (`M02`), a title, and the rest of the fields.
3. Save. The file is stored as `M02.yml`; MILO ids must start with `M02.`.

## Editing course outcomes (CILOs)

- Edit the title or statement freely.
- Do **not** rename a CILO id (`C1`, `C2`, …) once modules refer to it. If you
  must, tell the maintainer so the references can be updated in one commit.
- Deleting CILOs is disabled in the editor for the same reason.

## If something goes wrong

- If the site does not update after a few minutes, the data probably failed
  validation. Nothing is lost: the previous version of the site stays online.
- A red error usually means a duplicate id, a MILO id that does not match its
  module, or a reference to a CILO that does not exist. Ask the maintainer to
  run `npm run check` for the exact message.
- Every change is stored in git, so an earlier version can always be restored.

## Adding an editor

Ask the maintainer to invite the person's GitHub account as a collaborator.
Editors need write access to this repository only. Changes publish immediately
(no approval step); keep that in mind when editing live content.
