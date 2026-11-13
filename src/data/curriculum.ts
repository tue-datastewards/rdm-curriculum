import { parse } from 'yaml'
import { CurriculumSchema, validateCurriculum } from './schema'
import type { Curriculum } from './schema'

import courseRaw from '../../data/course.yml?raw'

const ciloFiles = import.meta.glob('../../data/cilos/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const moduleFiles = import.meta.glob('../../data/modules/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function parseFile(path: string, raw: string): unknown {
  try {
    return parse(raw)
  } catch (error) {
    throw new Error(
      `Could not parse ${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

const idNumber = (id: string) => Number(id.replace(/\D/g, '')) || 0

const cilos = Object.entries(ciloFiles)
  .map(([path, raw]) => parseFile(path, raw))
  .sort((a, b) => idNumber((a as { id: string }).id) - idNumber((b as { id: string }).id))

const modules = Object.entries(moduleFiles)
  .map(([path, raw]) => parseFile(path, raw))
  .sort((a, b) => idNumber((a as { id: string }).id) - idNumber((b as { id: string }).id))
  .map((module) => {
    const typed = module as { milos?: { id: string }[] }
    typed.milos?.sort((a, b) => a.id.localeCompare(b.id))
    return typed
  })

const parsed = CurriculumSchema.safeParse({
  course: parseFile('data/course.yml', courseRaw),
  cilos,
  modules,
})

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
  throw new Error(`The curriculum data does not match the schema:\n${details}`)
}

export const curriculum: Curriculum = parsed.data

/** Editorial checks, surfaced in the UI and printed by `npm run check`. */
export const validationIssues = validateCurriculum(curriculum)

if (import.meta.env.DEV) {
  for (const issue of validationIssues) {
    const log = issue.severity === 'error' ? console.error : console.warn
    log(`[curriculum] ${issue.where ? `${issue.where}: ` : ''}${issue.message}`)
  }
}
