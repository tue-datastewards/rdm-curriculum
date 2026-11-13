import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'
import { CurriculumSchema, validateCurriculum } from '../src/data/schema'
import type { Curriculum } from '../src/data/schema'

const dataDir = join(process.cwd(), 'data')

const c = {
  red: (s: string) => `\u001b[31m${s}\u001b[0m`,
  yellow: (s: string) => `\u001b[33m${s}\u001b[0m`,
  green: (s: string) => `\u001b[32m${s}\u001b[0m`,
  dim: (s: string) => `\u001b[2m${s}\u001b[0m`,
  bold: (s: string) => `\u001b[1m${s}\u001b[0m`,
}

async function readYamlFiles(dir: string): Promise<{ file: string; data: unknown }[]> {
  let names: string[]
  try {
    names = await readdir(dir)
  } catch {
    throw new Error(`Missing data directory: ${dir}`)
  }

  const files = names.filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  const entries: { file: string; data: unknown }[] = []

  for (const file of files.sort()) {
    const path = join(dir, file)
    const raw = await readFile(path, 'utf8')
    try {
      entries.push({ file, data: parse(raw) })
    } catch (error) {
      throw new Error(
        `Could not parse ${path}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return entries
}

function fail(message: string): never {
  console.error(`\n${c.red('✗')} ${message}\n`)
  process.exit(1)
}

const [courseFile, cilos, modules] = await Promise.all([
  readYamlFiles(dataDir).then((files) => {
    const course = files.find((entry) => entry.file === 'course.yml')
    if (!course) throw new Error('data/course.yml not found')
    return course.data
  }),
  readYamlFiles(join(dataDir, 'cilos')),
  readYamlFiles(join(dataDir, 'modules')),
])

const parsed = CurriculumSchema.safeParse({
  course: courseFile,
  cilos: cilos.map((entry) => entry.data),
  modules: modules.map((entry) => entry.data),
})

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
  fail(`The curriculum data does not match the schema:\n${details}`)
}

const curriculum: Curriculum = parsed.data
const issues = validateCurriculum(curriculum)

const misnamed: string[] = []
for (const cilo of curriculum.cilos) {
  const name = cilos.find((entry) => (entry.data as { id?: string }).id === cilo.id)?.file
  if (name && name !== `${cilo.id}.yml`) misnamed.push(`data/cilos/${name} → ${cilo.id}.yml`)
}
for (const module of curriculum.modules) {
  const name = modules.find((entry) => (entry.data as { id?: string }).id === module.id)?.file
  if (name && name !== `${module.id}.yml`) misnamed.push(`data/modules/${name} → ${module.id}.yml`)
}

if (misnamed.length > 0) {
  console.log(c.yellow('\nFile names do not match ids (the editor creates id-based names):'))
  for (const item of misnamed) console.log(`  ${c.yellow('!')} ${item}`)
}

const miloCount = curriculum.modules.reduce((total, module) => total + module.milos.length, 0)
const linkCount = curriculum.modules.reduce(
  (total, module) =>
    total + module.milos.reduce((sum, milo) => sum + milo.cilos.length, 0),
  0,
)

const errors = issues.filter((issue) => issue.severity === 'error')
const warnings = issues.filter((issue) => issue.severity === 'warning')

console.log(
  `\n${c.bold('RDM curriculum data')}\n` +
    `  ${c.dim('course')}  ${curriculum.course.title} (${curriculum.course.version})\n` +
    `  ${c.dim('counts')}  ${curriculum.cilos.length} CILOs · ${curriculum.modules.length} module(s) · ${miloCount} MILOs · ${linkCount} CILO–MILO links\n`,
)

if (issues.length === 0) {
  console.log(`  ${c.green('✓')} No issues found.\n`)
} else {
  for (const issue of issues) {
    const marker = issue.severity === 'error' ? c.red('✗') : c.yellow('!')
    const where = issue.where ? `${issue.where}: ` : ''
    console.log(`  ${marker} ${where}${issue.message}`)
  }
  console.log(
    `\n  ${errors.length} error(s), ${warnings.length} warning(s). ` +
      `${c.dim('Warnings do not block the build; errors do.')}\n`,
  )
}

if (errors.length > 0) {
  console.error(c.red(`\n✗ Validation failed.\n`))
  process.exit(1)
}

console.log(c.green('✓ Data is valid.\n'))
