# Editing the RDM curriculum

This guide is for curriculum editors. You do not need to install anything or use
git. You edit through a web form, and the course site rebuilds automatically.

## Sign in

1. Open `https://<internal-pages-url>/admin/`.
2. Choose **Sign in with GitLab** and use your TU/e GitLab account.
3. The first time, GitLab asks you to authorise the editor. Approve it.
4. You need the **Developer** role (or higher) on the project. Ask the
   maintainer if you get a permission error.

You will see three sections: **Course**, **Course outcomes (CILOs)** and
**Modules**. Use the preview icon in the editor to see the page you are editing.

## The two kinds of text

Every MILO has:

- an **official outcome statement** used in the alignment matrix and
  accreditation documents;
- an optional **learner section title** and **learner outcome statement**, which
  is what students actually read.

Keep the official statement precise and stable. Write the learner version in the
second person (“you”), for example:

> Official: Explain the purpose and benefits of a Data Management Plan throughout
> the research data lifecycle.
>
> Learner title: Why data management matters
> Learner statement: Explain how a data management plan helps you before, during
> and after your project.

If the learner fields are empty, the learner page falls back to the official text.

## Editing a module

1. Open **Modules** and choose a module.
2. Edit **Learner summary**, **Duration**, **Level** and **Learning path**.
3. Leave **Published to learners** off while the module is unfinished.
4. Expand **Module intended learning outcomes**.
5. Open a MILO and fill in:
   - **Official outcome statement** (required)
   - **Learner section title** and **Learner outcome statement**
   - **Content** — what the section explains; Markdown is supported
   - **Teaching → Learner's activity** — shown as “Your task”
   - **Resources** — labels and, where possible, URLs
   - **Assessment** — shown as “Check your understanding”
   - **Course outcomes addressed** — tick at least one
   - **Published to learners** — only when the section is ready
6. Press **Save**.

The live site updates in about a minute. Refresh to see it.

### What learners do not see

- Teaching → Teacher's activity
- Internal notes
- Editorial status (complete / migrated / draft)
- Phase (preparatory / in-session)
- Anything with **Published to learners** switched off

Empty blocks are hidden automatically: a section without resources simply has no
resources block.

### Formatting

Content fields accept Markdown:

```
- A bullet
  - A nested bullet
**bold text**
[link text](https://example.com)
```

Start bullets with `- ` and leave a blank line between paragraphs. Images are
not used in the course.

## Publishing checklist

Before switching a module or section to published:

- [ ] The module has a learner summary and a duration.
- [ ] Every published section has content and a task or activity.
- [ ] Resources that learners need have working URLs.
- [ ] The learner title and statement read naturally, without internal jargon.
- [ ] No “TBD”, “still looking for”, or notes to colleagues remain in learner text.
- [ ] At least one CILO is linked.
- [ ] “Published to learners” is on for the module and its ready sections.

Check the result at `/curriculum` (staff view) and then on `/modules`. The staff
view lists anything hidden and any missing components.

## Adding a module

1. **Modules → Add module**.
2. Use an ID such as `M02`; MILO IDs then start with `M02.`.
3. Fill in the title, summary, duration, level and path.
4. Leave it unpublished until the content is ready.

The file is stored as `M02.yml`. Do not change an ID once links or references
use it.

## Editing course outcomes

- Update the title or official statement freely.
- Do **not** rename a CILO ID (`C1`, `C2`, …) once MILOs refer to it.
- Deleting CILOs is disabled on purpose. Ask the maintainer if one must be
  retired.

## If something goes wrong

- If the site does not update, the new data probably failed validation. Nothing
  is lost: the previous version stays online.
- Common causes: a duplicate ID, a MILO ID that does not start with its module, or
  a published module with no summary, duration or published section.
- Ask the maintainer to run `npm run check` for the exact message. Every change is
  in git and can be restored.
- Saving publishes immediately (there is no approval step). Use the publish
  toggles carefully on live content.

## Who can edit

Editors need a TU/e GitLab account and the Developer role on the project.
Changes are committed under your name, so the history shows who changed what.
